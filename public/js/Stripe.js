const stripe = Stripe('pk_test_51NCo6BHGlagF10MOPV496O8YatZekF5K1NFZfV6hVLZAprnu7aHdNQ6kP84kCo61sB7jIRiFiUV7Za23fTUZzMqb00CPBxlDN9', {
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
    
    return await stripe.initEmbeddedCheckout({
        fetchClientSecret,
    });
}

async function listCustomers() {
    return await fetch("https://api.stripe.com/v1/customers", { // ?limit=3
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json, */*',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}

async function createCustomer(customer) {
    let customerData = new URLSearchParams({
        'name': customer.name,
        'email': customer.email,
        'metadata[password]': customer.metadata.password,
        'metadata[newsletterSubscription]': customer.metadata.newsletterSubscription,
        'metadata[profilePicture]': customer.metadata.profilePicture
    }).toString();
    
    return await fetch("https://api.stripe.com/v1/customers?"+customerData, {
        method: "POST",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then((response) => {
        return response.json();
    });
}

async function retrieveCustomer(queryEmail) {
    return await fetch("https://api.stripe.com/v1/customers/search?query=email~'"+queryEmail+"'", {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}

async function retrieveCustomerSession(sessionId) {
    return await fetch("https://api.stripe.com/v1/checkout/sessions/"+sessionId, {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    });
}

async function getCustomer(custId) {
    return await fetch("https://api.stripe.com/v1/customers/"+custId, {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    });
}

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
        'phone': updateData.phone,
        'metadata[password]': updateData.metadata.password,
        'metadata[newsletterSubscription]': updateData.metadata.newsletterSubscription
    }).toString();

    return await fetch("https://api.stripe.com/v1/customers/"+customerId+"?"+dataParams, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    }).then(response => {
        if (response.status == 200) {
            return response.json();
        }
    });
}

async function createPortalSession(customerId, redirectURL) {
    console.log(window.atob(await getConfig('STRIPE_SECRET_KEY')))
    return await fetch("https://api.stripe.com/v1/billing_portal/sessions?customer="+customerId+"&return_url="+encodeURIComponent(redirectURL), {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    }).then(response => {
        if (response.status == 200) {
            return response.json();
        }
    });
}

async function listProducts() {
    return await fetch("https://api.stripe.com/v1/products", { // ?limit=3
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json, */*',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}

async function listPrices() {
    return await fetch("https://api.stripe.com/v1/prices", { // ?limit=3
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json, *\/*',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}

async function createCustomerSession(customerSessionData) {
    var dataParamsmode = new URLSearchParams({
        // HYASSIN: TO DO - 'customer': customerSessionData['customer']['id'],
        'customer': 'cus_RDrytkx8RzmrHB',
        'mode': customerSessionData['mode'],
        'return_url': customerSessionData['domain'],
        'ui_mode': customerSessionData['uiMode'],
        'billing_address_collection': 'required',
        'line_items[0][price]': customerSessionData['price'],
        'line_items[0][quantity]': '1'
    }).toString();

    return await fetch("https://api.stripe.com/v1/checkout/sessions?"+dataParamsmode, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    }).then(response => {
        return response;
    });
}

async function retrieveSubscriptionStatus(subscriptionId) {
    return await fetch("https://api.stripe.com/v1/subscriptions/"+subscriptionId, { // ?limit=3
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json, *\/*',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    });
}

async function retrieveActiveSubscription(customerId) {
    var dataParamsmode = new URLSearchParams({
        'customer': customerId,
        'status': 'active',
        'limit': '1'
    }).toString();
    
    return await fetch("https://api.stripe.com/v1/subscriptions?"+dataParamsmode, { // ?limit=1
        method: "GET",
        mode: "cors",
        cache: "force-cache",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json, *\/*',
            'Authorization': 'Bearer '+window.atob(await getConfig('STRIPE_SECRET_KEY'))
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
    }).then(response => {
        if( response.status == 200 ) {
            return response.json();
        }
    }).then(json => {
        return json['data'];
    });
}