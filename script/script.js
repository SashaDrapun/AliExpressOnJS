document.addEventListener('DOMContentLoaded', () => {

    const search = document.querySelector('.search'),
        cartBtn = document.getElementById('cart'),
        wishListBtn = document.getElementById('wishlist'),
        goodsWrapper = document.querySelector('.goods-wrapper'),
        cart = document.querySelector('.cart'),
        category = document.querySelector('.category'),
        cartWrapper = document.querySelector('.cart-wrapper');

    const cardCounter = cartBtn.querySelector('.counter');
    const wishlistCounter = wishListBtn.querySelector('.counter');

    const wishlist = [];

    const goodsBasket = {};

    // запрос на сервер
    const loading = (nameFunction) => {
        const spinner = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
        </div><div><div></div></div><div><div></div></div><div><div></div></div></div></div></div>
        `;

        if(nameFunction === 'renderCard'){
            goodsWrapper.innerHTML = spinner;
        }

        if(nameFunction === 'renderBasket'){
            cartWrapper.innerHTML = spinner;
        }
    };

    // генерация карточек
    const getGoods = (handler, filter) => {
        loading(handler.name);
        fetch('db/db.json')
            .then(response => response.json())
            .then(filter)
            .then(handler);
    };

    const CreateCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `<div class="card">
            <div class="card-img-wrapper">
                <img class="card-img-top" src="${img}" alt="">
                <button class="card-add-wishlist ${wishlist.includes(id) ? 'active':''}"
                 data-goods-id="${id}">
                </button>
            </div>
            <div class="card-body justify-content-between">
                <a href="#" class="card-title">${title}</a>
                <div class="card-price">${price} ₽</div>
                <div>
                    <button class=card-add-cart data-goods-id="${id}">Добавить в корзину</button>
                </div>
            </div>
            </div>`;
        return card;
    };

    const renderCard = (items) => {
        goodsWrapper.textContent = '';

        if (items.length) {
            items.forEach(({
                id,
                title,
                price,
                imgMin
            }) => {
                goodsWrapper.appendChild(CreateCardGoods(id, title, price, imgMin));
            });
        } else {
            goodsWrapper.textContent = 'Ничего не найдено';
        }
    };


    //cоздание корзины
    const CreateCartGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'goods';
        card.innerHTML = `<div class="goods-img-wrapper">
        <img class="goods-img" src="${img}" alt="">

    </div>
    <div class="goods-description">
        <h2 class="goods-title">${title}</h2>
        <p class="goods-price">${price} ₽</p>

    </div>
    <div class="goods-price-count">
        <div class="goods-trigger">
            <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active':''}" 
            data-goods-id="${id}"></button>
            <button class="goods-delete" data-goods-id="${id}"></button>
        </div>
        <div class="goods-count">${goodsBasket[id]}</div>
    </div>`;
        return card;
    };

    const renderCart = (items) => {
        cartWrapper.textContent = '';

        if (items.length) {
            items.forEach(({
                id,
                title,
                price,
                imgMin
            }) => {
                cartWrapper.appendChild(CreateCartGoods(id, title, price, imgMin));
            });
        } else {
            cartWrapper.innerHTML = '<div id="cart-empty"> Ваша корзина пока пуста </div>';
        }

    };


    //end cоздание корзины

    // калькуляция
    const checkCount = () => {
        wishlistCounter.textContent = wishlist.length;
        cardCounter.textContent = Object.keys(goodsBasket).length;
    };

    
    const calcTotalPrice = (goods)=>{

        let sum = goods.reduce((accum, item)=>{
            return accum+(item.price * goodsBasket[item.id]);
        },0);
       // for(const item of goods){
       //     sum += item.price * goodsBasket[item.id];
       // }
       cart.querySelector('.cart-total>span').textContent = sum.toFixed(2);
   };

   
    // end калькуляция

    const randomSort = (items) => {
        return items.sort(() => Math.random() - 0.5);
    };

    const closeCart = (event) => {
        const target = event.target;

        if (target === cart || target.classList.contains('cart-close')) {
            cart.style.display = 'none';
        }

    };

    const closeCartByEsc = (event) => {
        if (event.key === 'Escape') {
            cart.style.display = 'none';
        }
    };

    const showCardBasket = goods => {
        const basketGoods = goods.filter(item=> goodsBasket.hasOwnProperty(item.id));
        calcTotalPrice(basketGoods);
        return basketGoods;
    };

    const openCart = (event) => {
        event.preventDefault();
        cart.style.display = 'flex';
        getGoods(renderCart, showCardBasket);
    };

    const chooseCategory = (event) => {
        event.preventDefault();
        const target = event.target;

        if (target.classList.contains('category-item')) {
            const category = target.dataset.category;

            getGoods(renderCard,
                goods => goods.filter(item => item.category.includes(category)));
        }
    };


    // работа с хранилищем
    const storageQuery = get => {
        if (get) {
            if (localStorage.getItem('wishlist')) {
                wishlist.push(...JSON.parse(localStorage.getItem('wishlist')));
            }
        } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }

    };

    const getCookie = (name)=> {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
      };

    const cookieQuery = get =>{
        if(get){
            if(getCookie('goodsBasket')){
                Object.assign(goodsBasket,JSON.parse(getCookie('goodsBasket')));
            }
       }
        else{
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)}; max-age=${60*60*24}`;
        }
    };

    const searchGoods = event => {
        event.preventDefault();

        const input = event.target.elements.searchGoods;

        if (input.value !== '') {
            const searchString = new RegExp(input.value, 'gi');
            getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));

            input.value = '';
        } else {
            search.classList.add('error');

            setTimeout(() => {
                search.classList.remove('error');
            }, 2000);
        }
    };


    

    const toogleWhishList = (id, element) => {
        if (wishlist.indexOf(id) + 1) {
            wishlist.splice(wishlist.indexOf(id), 1);
            element.classList.remove('active');
        } else {
            wishlist.push(id);
            element.classList.add('active');
        }
        checkCount();
        storageQuery();
    };

  

    const addBasket = id => {
        console.log(id);
        if(goodsBasket[id]){
            goodsBasket[id] += 1;
        } else{
            goodsBasket[id] = 1;
        }
        checkCount();
        cookieQuery();
    };

    const handlerGoods = event => {
        const target = event.target;

        if (target.classList.contains('card-add-wishlist')) {
            toogleWhishList(target.dataset.goodsId, target);
        }
    
        if(target.classList.contains('card-add-cart')){
            addBasket(target.dataset.goodsId);
        }
    };

    const showWishlist = () => {
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)));
    };

    const removeGoods = id => {
        delete goodsBasket[id];
        cookieQuery();
        getGoods(renderCart, showCardBasket);
        checkCount();
    };

    const handlerBasket = (event) => {
        const target = event.target;

        if (target.classList.contains('goods-add-wishlist')) {
            toogleWhishList(target.dataset.goodsId, target);
        }

        if (target.classList.contains('goods-delete')) {
           removeGoods(target.dataset.goodsId);
        }
    };

    const init = ()=>{
        getGoods(renderCard, randomSort);
        storageQuery(true);
        cookieQuery(true);
        checkCount();
    };

    cartBtn.addEventListener('click', openCart);
    cart.addEventListener('click', closeCart);
    document.addEventListener('keydown', closeCartByEsc);
    category.addEventListener('click', chooseCategory);
    search.addEventListener('submit', searchGoods);
    goodsWrapper.addEventListener('click', handlerGoods);
    wishListBtn.addEventListener('click', showWishlist);
    cartWrapper.addEventListener('click',handlerBasket);

    init();
});