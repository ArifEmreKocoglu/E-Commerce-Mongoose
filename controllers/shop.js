const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
exports.getIndex =  (req, res, next)=>{
    // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.  
    // const products = Product.getAll(); // BÜTÜN ÜRÜNLERİ GÖNDERİR
    Product.find()
        .then(products => {
            return products;
        })
        .then(products => {
            Category.find()
            .then(categories => {
                res.render('shop/index', {title: 'Shopping', products: products, categories: categories ,path : '/'}); // PUG DOSYASI EKLEME BÖYLE ÜSTEKİ HTML            
            })
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.getProducts =  (req, res, next)=>{
    // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.  
    // const products = Product.getAll(); // BÜTÜN ÜRÜNLERİ GÖNDERİR

    // eq (equal)
    // ne (not equal)
    // gt (greater than)
    // gte (greater than or equal)
    // lt (less than)
    // lte (less than or equal)
    // in
    // nin (not in)
    // starts with // .find({name: /^Samsung/})
    // ends with
    // contains // içerik her yeerde olabilir eşleşince geri getirir.
    Product.find()
    // .find({price: {$eq: 2000}}) // fiyatı 2000 olanları almış oluruz. gibi....
    .then(products => {
        return products;
    })
    .then(products => {
        Category.find()
            .then(categories => {
                res.render('shop/products', {title: 'Products', products: products,categories: categories ,path : '/'}); // PUG DOSYASI EKLEME BÖYLE ÜSTEKİ HTML
            })
    })
    .catch((err) => {

        console.log(err);
    })
}
exports.getProductsByCategoryId =  (req, res, next)=>{
    // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.
    const categoryid = req.params.categoryid;
    const model = [];
    
    Category.find()
        .then(categories =>{
            model.categories = categories;
            return Product.find({
                categories: categoryid
            });
        })
        .then(products =>{
            res.render('shop/products', {
                title: 'Products', 
                products: products, 
                categories: model.categories,
                selectedCategory: categoryid, 
                path : '/products'
            }); // PUG DOSYASI EKLEME BÖYLE ÜSTEKİ HTML
        })
        .catch((err) =>{
            console.log(err);
        })

    
}

exports.getProduct =  (req, res, next)=>{
    Product.findById(req.params.productid) // id bilgisine göre seçme yapar.
        .then((product)=>{
            res.render('shop/product-detail', {
                title: product.name,
                product: product,
                path: '/products' 
            });
        })
        .catch((err) =>{
            console.log(err);
        });

    
}


exports.getCart =  (req, res, next)=>{
    // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.  
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user =>{
            res.render('shop/cart', {title: 'Cart',products: user.cart.items ,path : '/cart'}); // PUG DOSYASI EKLEME BÖYLE ÜSTEKİ HTMLL
        })
        .catch(err =>{
            console.log(err);
        })
}


exports.postCart =  (req, res, next)=>{
    // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.  
    
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {console.log(err)});
}

exports.postCartItemDelete =  (req, res, next)=>{
    // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.  
    const productid = req.body.productid;

    req.user
        .deleteCartItem(productid)
        .then(() =>{
            res.redirect('/cart');
        });
}


exports.getOrders =  (req, res, next)=>{
   // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.  
   Order
    .find({ 'user.userId': req.user._id })
    .then(orders => {
        res.render('shop/orders', {
            title: 'Orders',
            path: '/orders',
            orders: orders
        });
    })
    .catch(err => {console.log(err)});
      
}

exports.postOrders =  (req, res, next)=>{
    req.user
        .populate('cart.items.productId')
        .execPopulate()    
        .then(user => {
            const order = new Order({
                user:{
                    userId: req.user._id,
                    name: req.user.name,
                    email: req.user.email
                },
                items: user.cart.items.map(p =>{
                    return {
                        product: {
                            _id: p.productId._id,
                            name: p.productId.name,
                            price: p.productId.price,
                            imageUrl: p.productId.imageUrl
                        },
                        quantity: p.quantity
                    };
                })
            });
            return order.save();
        })
        .then(()=> {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(err => {console.log(err)});
}

