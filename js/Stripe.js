/* const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
}); */

// const stripe_api_id = 'pk_live_51NCo6BHGlagF10MOmT0OjtMjbKsxCZ9rN2v8jiXDoOKn1rUe5T2i9TcUq7zSmNQtaIzhgSxGAwrd40hv3EpPYwIC00k8fN2AyI';
const stripe_api_id = 'pk_test_51NCo6BHGlagF10MOPV496O8YatZekF5K1NFZfV6hVLZAprnu7aHdNQ6kP84kCo61sB7jIRiFiUV7Za23fTUZzMqb00CPBxlDN9';
// const stripe_secret_key = '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';
const stripe_secret_key = 'sk_test_51NCo6BHGlagF10MO2OLEeUglmNeUuRlHWEpnB5GfWcztAZK4I2UQH69mPHzvRmR4wCvNikelpGuaw5e8NxJe0N4O00Y8u7trY3';
const stripe = Stripe(stripe_api_id, {
    stripeAccount: 'acct_1NCo6BHGlagF10MO'
});

const appearance = {
    theme: 'stripe',
    variables: {
        fontFamily: 'Open Sans, sans-serif',
        fontLineHeight: '1.5',
        borderRadius: '10px',
        colorBackground: '#FFFFFF',
        accessibleColorOnColorPrimary: '#262626'
    },
    rules: {
        '.Block': {
        backgroundColor: 'var(--colorBackground)',
        boxShadow: 'none',
        padding: '12px'
        },
        '.Input': {
        padding: '12px',
        color: 'grey',
        fontSize: '.875rem',
        border: '1px solid var(--p-colorBackgroundDeemphasize10)'
        },
        '.Input::placeholder': {
            color: 'lightgrey',
        },
        '.Input:disabled, .Input--invalid:disabled': {
        color: 'lightgrey',
        fontSize: '.875rem'
        },
        '.Tab': {
        padding: '10px 12px 8px 12px',
        border: 'none'
        },
        '.Tab:hover': {
        border: 'none',
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
        },
        '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
        border: 'none',
        backgroundColor: '#fff',
        boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
        },
        '.Label': {
        fontWeight: '600',
        fontSize: '.875rem',
        color: '#525f7f'
        }
    }
};

const elements = stripe.elements({appearance});

async function initializePaymentServer(checkoutFormInput) {
    const fetchClientSecret = async () => {
        return await createCustomerSession(checkoutFormInput).then((response) => {
            return response.json();
        }).then(checkoutSession => {
            return checkoutSession['client_secret'];
        });
    };
    
    // Initialize Checkout
    return await stripe.initEmbeddedCheckout({
        fetchClientSecret,
    });
}

// curl -G https://api.stripe.com/v1/customers -u "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:"
async function listCustomers() {
    return await fetch("https://api.stripe.com/v1/customers", { // ?limit=3
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json, */*',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}

// curl -G https://api.stripe.com/v1/customers -u "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:" -d name="Hesham Yassin" --data-urlencode email="heshamgyassin@gmail.com"
async function createCustomer(customer) {
    let customerData = new URLSearchParams({
        'name': customer.name,
        'email': customer.email,
        'metadata[password]': customer.metadata.password,
        'metadata[newsletterSubscription]': customer.metadata.newsletterSubscription,
        'metadata[profilePicture]': customer.metadata.profilePicture
    }).toString();
    
    return await fetch("https://api.stripe.com/v1/customers?"+customerData, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then((response) => {
        return response.json();
    });
}

// curl -G https://api.stripe.com/v1/customers/search -u "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:" --data-urlencode query="email~'heshamgyassin@gmail.com'"
async function retrieveCustomer(queryEmail) {
    return await fetch("https://api.stripe.com/v1/customers/search?query=email~'"+queryEmail+"'", {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        // customers[0]['name'];
        return json['data'];
    });
}

// curl -G https://api.stripe.com/v1/checkout/sessions/cs_test_a11YYufWQzNY63zpQ6QSNRQhkUpVph4WRmzW0zWJO2znZKdVujZ0N0S22u -u "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:"
async function retrieveCustomerSession(sessionId) {
    return await fetch("https://api.stripe.com/v1/checkout/sessions/"+sessionId, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    });
}

// curl -G https://api.stripe.com/v1/customers/cus_NypfNjMLrGyh8C -u "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:"
async function getCustomer(custId) {
    return await fetch("https://api.stripe.com/v1/customers/"+custId, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    });
}

// curl https://api.stripe.com/v1/customers/cus_NypfNjMLrGyh8C -u "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:" -d "metadata[password]"=DANio92lessCRY@
async function updateCustomer(customerId, updateData) {
    let dataParams = new URLSearchParams({
        'name': updateData.name,
        'email': updateData.email,
        'address[line1]': updateData.address.line1,
        'address[line2]': updateData.address.line2,
        'address[city]': updateData.address.city,
        'address[country]': updateData.address.country,
        'address[postal_code]': updateData.address.postal_code,
        'address[state]': updateData.address.state,
        /* 'shipping[address][line1]': updateData.shipping.line1,
        'shipping[address][line2]': updateData.shipping.line2,
        'shipping[address][city]': updateData.shipping.city,
        'shipping[address][country]': updateData.shipping.country,
        'shipping[address][postal_code]': updateData.shipping.postal_code,
        'shipping[address][state]': updateData.shipping.state, */
        'phone': updateData.phone,
        'metadata[password]': updateData.metadata.password,
        'metadata[newsletterSubscription]': updateData.metadata.newsletterSubscription
    }).toString();

    return await fetch("https://api.stripe.com/v1/customers/"+customerId+"?"+dataParams, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if (response.status == 200) {
            return response.json();
        }
    });
}

// curl https://api.stripe.com/v1/billing_portal/sessions -u "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:" -d customer=cus_NypfNjMLrGyh8C  --data-urlencode return_url="http://hgyassin.github.io/himjrnl/index.html"
async function createPortalSession(customerId, redirectURL) {
    return await fetch("https://api.stripe.com/v1/billing_portal/sessions?customer="+customerId+"&return_url="+encodeURIComponent(redirectURL), {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if (response.status == 200) {
            return response.json();
        }
    });
}

// curl -G https://api.stripe.com/v1/products -u "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:"
async function listProducts() {
    return await fetch("https://api.stripe.com/v1/products", { // ?limit=3
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json, */*',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}

// curl -G https://api.stripe.com/v1/prices -u "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:"
async function listPrices() {
    return await fetch("https://api.stripe.com/v1/prices", { // ?limit=3
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json, *\/*',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}

// curl https://api.stripe.com/v1/checkout/sessions -u "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:" -d customer=cus_NypfNjMLrGyh8C  --data-urlencode return_url="http://hgyassin.github.io/himjrnl/index.html"
async function createCustomerSession(customerSessionData) { // quantity, 
    var dataParamsmode = new URLSearchParams({
        // 'customer': customerSessionData['customer']['id'],
        'customer': 'cus_RDrytkx8RzmrHB',
        'mode': customerSessionData['mode'],
        'return_url': customerSessionData['domain'],
        'ui_mode': customerSessionData['uiMode'],
        'billing_address_collection': 'required',
        'line_items[0][price]': customerSessionData['price'],
        'line_items[0][quantity]': '1'
    }).toString();

    return await fetch("https://api.stripe.com/v1/checkout/sessions?"+dataParamsmode, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        return response;
    });
}

// curl -G https://api.stripe.com/v1/subscriptions/sub_1MowQVLkdIwHu7ixeRlqHVzs -u "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:"
async function retrieveSubscriptionStatus(subscriptionId) {
    return await fetch("https://api.stripe.com/v1/subscriptions/"+subscriptionId, { // ?limit=3
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json, *\/*',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    });
}

// curl -G https://api.stripe.com/v1/subscriptions -u "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:" -d limit=1
async function retrieveActiveSubscription(customerId) {
    var dataParamsmode = new URLSearchParams({
        'customer': customerId,
        'status': 'active',
        'limit': '1'
    }).toString();
    
    return await fetch("https://api.stripe.com/v1/subscriptions?"+dataParamsmode, { // ?limit=1
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json, *\/*',
            'Authorization': 'Bearer '+stripe_secret_key
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}