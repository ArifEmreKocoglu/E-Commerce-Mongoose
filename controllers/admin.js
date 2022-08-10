const Product = require('../models/product');
const Category = require('../models/category');


exports.getProducts =  (req, res, next)=>{
    // res.sendFile(path.join(__dirname, '../', 'views', 'index.html')); // res hem sonlanır hemde içerik yazılabilir.  
    // const products = Product.getAll(); // BÜTÜN ÜRÜNLERİ GÖNDERİR
   
    Product
        .find()
        .populate('userId', 'name') // ref kısmına gidip asıl yerden alıp aşağıya gönderir.. 2. paramettre istediğimiz i getir diyoruz
        .select('name price imageUrl userId')
        .then(products => {
            console.log(products);
            res.render('admin/products', {title: 'Admin Page', products: products ,action: req.query.action , path :'/admin/products'}); // PUG DOSYASI EKLEME BÖYLE ÜSTEKİ HTML
        })
        .catch((err) => {
            console.log(err);
        })
 }

 exports.getAddProduct = (req, res, next)=>{ // sadece get için çalışır.
    // res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'));
    res.render('admin/add-product', {title:'New Product',path : '/admin/add-product'});
}

exports.postAddProduct = (req, res, next)=>{ //app.post yapmamızın sebebi içine bişey geldiğinde çalışmasını sağlamak.
    //data base kayıt.
    const name = req.body.name;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;

    const product = new Product(
        {
            name: name,
            price: price,
            imageUrl: imageUrl,
            description: description,
            userId: req.user // eklenen producta userId de eklemiş oluruz bunu middleware dan çekiyoruz ve obje olarak alıyoruz.
        }
    );
    product.save()
    .then(() =>{
        res.redirect('/admin/products');
    })
    .catch(err =>{
        console.log(err);
    })
}

exports.getEditProduct = (req, res, next)=>{ // sadece get için çalışır.
    Product.findById(req.params.productid)
    // .populate('categories', 'name') // categori bilgileri gelir. seçer onları. obje şeklinde alırız
        .then(product => {
            return product
        })
        .then(product => {

            Category.find()
                .then(categories => {

                    categories = categories.map(category => {
                        
                        if(product.categories){
                            product.categories.find(item=> {
                                if(item.toString() === category._id.toString()){
                                    category.selected = true;
                                }
                            })
                        }
                        
                        return category
                    })

                    res.render('admin/edit-product', {title:'Edit Product',path : '/admin/products', product: product, categories: categories});
                })
        })
        .catch(err =>{console.log(err)});
    
}

exports.getAddCategory = (req, res, next) => {
    res.render('admin/add-category', {title:'New Category',path : '/admin/add-category'});
}

exports.getCategories = (req, res, next)=>{
    Category.find()
    .then(categories => {
        res.render('admin/categories', {title: 'Categories', categories: categories, action: req.query.action , path :'/admin/categories'}); // PUG DOSYASI EKLEME BÖYLE ÜSTEKİ HTML
    })
    .catch((err) => {
        console.log(err);
    })
}

exports.postAddCategory = (req, res ,next) => {
    const name = req.body.name;
    const description = req.body.description;

    const category = new Category({
        name: name,
        description: description
    });
    category.save()
        .then(result =>{
            res.redirect('/admin/categories?action=create');
        })
        .catch(err =>{
            console.log(err);
        })
}

exports.postEditProduct = (req, res, next)=>{ //app.post yapmamızın sebebi içine bişey geldiğinde çalışmasını sağlamak.
    
    // İKİ FARKLI ŞEKİLDE GÜNCELLEYE BİLİRİZ..
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    const ids = req.body.categoryids;
    
    Product.update({_id: id},{
        $set: {
            name: name,
            price: price,
            imageUrl: imageUrl,
            description: description,
            categories: ids
        }
    })
    .then(() => {
        res.redirect('/admin/products?action=edit');
    })
    .catch(err => console.log(err));

    // Product.findById(id)
    //     .then(product => {
    //         product.name = name;
    //         product.price = price;
    //         product.imageUrl = imageUrl;
    //         product.description = description;
    //         return product.save();
    //     })
    //     .then(() => {
    //         res.redirect('/admin/products?action=edit');
    //     })
    //     .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {

    const id = req.body.productid;

    Product.deleteOne({_id: id}) // gelen ile olan id eşleşirse siler.
        .then(() =>{
            res.redirect('/admin/products?action=delete');
        })
        .catch(err => {
            console.log(err);
        });    
}

exports.getEditCategory = (req, res, next) => {
    Category.findById(req.params.categoryid)
        .then(category => {
            console.log(category);
            res.render('admin/edit-category', {title:'Edit Category', path : '/admin/categories', category: category});
        })
        .catch(err =>{console.log(err)});
}

exports.postEditCategory = (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    
    Category.findById(id)
        .then(category => {
            category.name = name;
            category.description = description;
            return category.save()        
        })
        .then(() => {
            res.redirect('/admin/categories?action=edit'); // anasayfaya yönlendir.
        })
        .catch(err => console.log(err));
}

exports.postDeleteCategory = (req, res, next) => {
    const id = req.body.categoryid;

    Category.findByIdAndRemove(id)
        .then(() => {
            res.redirect('/admin/categories?action=delete');
        })
        .catch(err => console.log(err));
}
