const router = require('express').Router();
const { User, Posts, Comments } = require('../models');
const withAuth = require('../utils/auth');
const currentDateTime = require('../utils/helpers');

// Route "/" -- Homepage
router.get('/', (req, res) => {
    Posts.findAll({
            attributes: ['id', 'title', 'content', 'createdAt'],
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Comments,
                    attributes: ['id', 'comment', 'user_id', 'createdAt'],
                    order: [['createdAt', 'ASC']],
                    include: {
                        model: User,
                        attributes: ['username'],
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        })

        .then(postData => {
            const posts = postData.map((post) => post.get({ plain: true }));

            res.render('homepage', {
                posts,
                loggedIn: req.session.loggedIn,
            });
        })
        .catch (err => {
            console.log(err);
            res.status(500).json(err);
        });
    });

// Route "/login"
router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    res.render('login');
});

// Route "/signup"
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Route "/dashboard" -- See all of current users posts

router.get('/dashboard', withAuth, (req, res) => {
    Posts.findAll({
            where: {
                user_id: req.session.user_id,
            },
            attributes: [
                'id',
                'title',
                'content',
                'createdAt'
            ],
            include: [{
                    model: Comments,
                    attributes: ['id', 'comment', 'user_id', 'createdAt'],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        })
        .then(dbPostData => {
            const posts = dbPostData.map(post => post.get({ plain: true }));
            console.log(dbPostData);
            res.render('dashboard', { posts, loggedIn: true });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// Route "/dashboard/new" -- Add new post
router.get('/dashboard/new', (req, res) => {
    res.render('newPost', {
        loggedIn: true
    })
});

// Route "/dashboard/edit/:id" --- Edit Selected Post
router.get('/dashboard/edit/:id', (req, res) => {
    Posts.findByPk(req.params.id, {
        attributes: [
            'id',
            'title',
            'content',
            'createdAt'
        ],
    })
    .then(dbPostData => {
        const posts = dbPostData.get({ plain: true });
        console.log(dbPostData);
        res.render('updatePost', { posts, loggedIn: true });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;