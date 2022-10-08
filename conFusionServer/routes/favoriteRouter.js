const express        = require('express');
const mongoose       = require('mongoose');
var authenticate     = require('../authenticate');
const Favorites      = require('../models/favorites');
const cors           = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.use(express.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    console.log("User: ", req.user);
    Favorites.find({user: req.user._id})
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log('Request body: ', req.body);
    Favorites.find({user: req.user._id})
    .populate('dishes')
    .then((favorites) => {
        if (favorites != null && favorites.length > 0) {
            console.log("favorites found: ", favorites);
            console.log("favorites.dishes: ", favorites[0].dishes);
            for (var i = 0; i < req.body.dishes.length; i++){
                if (favorites[0].dishes && favorites[0].dishes.filter(dish => dish._id.equals(req.body.dishes[i]._id) ).length > 0) {
                    console.log('Dish already in the list ', req.body.dishes[i]);
                } else {
                    favorites[0].dishes.push(req.body.dishes[i]);
                    console.log('Dish added ', req.body.dishes[i]);
                }
            }
            favorites[0].save()
            .then((favorite) => {
                console.log('Favorite saved');
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);                
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {
            req.body.user = req.user._id;
            Favorites.create(req.body)
            .then((favoriteCreated) => {
                console.log('Favorite Created ', favoriteCreated);
                Favorites.findById(favoriteCreated._id)
                .populate('user')
                .populate('dishes')
                .then((newFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(newFavorite);                
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log('Request param: ', req.params.dishId);
    Favorites.find({user: req.user._id})
    .populate('dishes')
    .then((favorites) => {
        if (favorites != null && favorites.length > 0) {
            console.log("favorites found: ", favorites);
            console.log("favorites.dishes: ", favorites[0].dishes);
            if (favorites[0].dishes && favorites[0].dishes.filter(dish => dish._id.equals(req.params.dishId) ).length > 0) {
                console.log('Dish already in the list ', req.params.dishId);
            } else {
                favorites[0].dishes.push(req.params.dishId);
                console.log('Dish added ', req.params.dishId);
            }
            favorites[0].save()
            .then((favorite) => {
                console.log('Favorite saved');
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);                
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {
            Favorites.create({user: req.user._id, dishes: [{_id: req.params.dishId}]})
            .then((newFavorite) => {
                console.log('Favorite Created ', newFavorite);
                Favorites.findById(newFavorite._id)
                .populate('user')
                .populate('dishes')
                .then((newFavorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(newFavorite);
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log('Request param: ', req.params.dishId);
    Favorites.find({user: req.user._id})
    .populate('dishes')
    .then((favorites) => {
        if (favorites != null && favorites.length > 0) {
            console.log("favorites found: ", favorites);
            console.log("favorites.dishes: ", favorites[0].dishes);
            if (favorites[0].dishes && favorites[0].dishes.filter(dish => dish._id.equals(req.params.dishId) ).length > 0) {
                favorites[0].dishes.pull(req.params.dishId);
                favorites[0].save()
                .then((favorite) => {
                    console.log('Dish removed ', req.params.dishId);
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }, (err) => next(err));
            } else {
                console.log('Dish not a favorite. Nothing to delete.');
                res.statusCode = 200;
                res.end();
            }
        } else {
            console.log('Favorite empty ');
            res.statusCode = 200;
            // res.setHeader('Content-Type', 'application/json');
            res.end();
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;