/*!
 *
 * HiM is a men lifestyle journal, issued on monthly basis, to cover all subjects of interest of the
 * modern-age rugged gentleman all over the world; from travel, business, entertainment, entrepreneurship,
 * finance, fashion, skills, gadgets and a lot more
 *
 * EDITOR IN CHIEF. Hesham Yasein. heshamgyassin@gmail.com
 *
 * All rights reserved to HiM 2023 (C)
 *
 * License:
 * This code is based on turnjs - http://turnjs.com
 * Copyright (C) 2012 Emmanuel Garcia
 * The turn.js project is released under the BSD license and it's available on GitHub.
 * This license doesn't include features of the 4th release.
 *
 * wavesurfer.js 5.0.1 (2021-05-05)
 * https://wavesurfer-js.org
 * @license BSD-3-Clause
 *
 *
 * Opinions expressed are solely those of the contributors.
 * No part of this magazine may be reproduced or transmitted in any form or by any means without a written
 * permission of the publisher.
 *
 */

// const clientId = '324503206928-c9vc49mtttkf4gfi5qf4qnn838p4j2fk.apps.googleusercontent.com';
// const clientSecret = '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';
const scopes = 'openid profile email';
const responseType = 'code';
const redirectURI = new URL(decodeURIComponent(domain + '/auth/login.html'));

var addressElement,
[
    addressChange, 
    emailChange, 
    oldPasswordChange, 
    newPasswordChange, 
    confirmNewPasswordChange,
    profilePictureChange
] = Array(6).fill(null).map(() => JSON.parse('{ "data": null, "change": false }'));

async function authMain() {
    
    initializeMagazine();

    parseLoginAuth();

    if ((localStorage.getItem('customerLoggedIn') != false) && (localStorage.getItem('customerLoggedIn') != null)) {
        getCustomer(JSON.parse(localStorage.getItem('customerProfile'))['id']).then((customer) => {
            localStorage.setItem('customerProfile', JSON.stringify(customer));
        });
        prepareProfile();
	} else {
		/* Do Nothing */
	}

    /* HYASSIN:
     * In case of localstorage has loggedin customer, retrieve the customer subscription status,
     * otherwise, if the url has session_id, then parseCheckoutSessionData
     * else, do nothing
     */
    if ((localStorage.getItem('customerLoggedIn') != false) && (localStorage.getItem('customerLoggedIn') != null)) {
        /* HYASSIN: TO DO - Customer is loggedin already, retrieve the customer subscription status */
    } else if ((localStorage.getItem('customerLoggedIn') == false) || (localStorage.getItem('customerLoggedIn') == null)) {
        parseCheckoutSessionData().then((session) => {
            if (session != null) {
                /* HYASEIN: TO DO - What action when Payment is return SUCCESSFUL */
                if (session['payment_status'] == "paid" && session['status'] == "complete" && session['subscription'] != null) {
                    retrieveSubscriptionStatus(session['subscription']).then((subscriptionData) => {
                        if (subscriptionData['status'] == "active") {
                            /* HYASSIN: TO DO - What action when subscription is Active? */
                        } else {
                            /* HYASSIN: TO DO - What action when subscription is not Active?

                            Subscription is not active, it could be Failed Payment ➔ past_due
                            or Retries Exhausted (with no payment) ➔ unpaid (if cancellation isn’t automatic)
                            or canceled (if automatic cancellation is configured)
                            */
                        }
                    })
                }
                else {
                    /* HYASEIN: Do nothing, because failed payments have no subscription */
                }
            } else {
                /* HYASEIN: Do nothing, because failed payments are not returned */
            }
        });
    } else {

    }
}

async function parseCheckoutSessionData() {
    const parsedUrl = new URL(decodeURIComponent(window.location));
    const checkoutSessionId = parsedUrl.searchParams.get("session_id");
	
    if (checkoutSessionId) {
        return await retrieveCustomerSession(checkoutSessionId);
    }
}

function toggleSignupLogin(mode) {
    let loginCard = document.getElementById("cardCustomerLogin"),
    signupCard = document.getElementById("cardCustomerSignup");
    switch (mode) {
        case "signup":
            loginCard.classList.remove("active");
            loginCard.classList.add("inactive");
            signupCard.classList.remove("inactive");
            signupCard.classList.add("active");
        break;
        case "login":
            loginCard.classList.remove("inactive");
            loginCard.classList.add("active");
            signupCard.classList.remove("active");
            signupCard.classList.add("inactive");
        break;
        default: 
            loginCard.classList.remove("active");
            loginCard.classList.add("inactive");
            signupCard.classList.remove("inactive");
            signupCard.classList.add("active");
    }
}

/********************************************************************
 **************** Signin using Google and Facebook ****************
********************************************************************/
function secureRandom(size) {
    return btoa([].slice.call(
        (window.crypto||window.msCrypto).getRandomValues(new Uint8Array(size)).join('')
    ).map(b => String.fromCharCode(b)).join(''));
}

function googleLogin(mode) {
    sessionStorage.setItem("securityToken", "security_token="+secureRandom(32));
    sessionStorage.setItem("loginMode", mode);
    window.open("https://accounts.google.com/o/oauth2/v2/auth?response_type="+encodeURIComponent(responseType)+"&client_id="+clientId+"&scope="+encodeURIComponent(scopes)+"&nonce="+encodeURIComponent(secureRandom(7))+"-"+encodeURIComponent(secureRandom(7))+"-"+encodeURIComponent(secureRandom(7))+"&prompt=consent&display=popup&redirect_uri="+redirectURI.href.toString()+"&state="+encodeURIComponent(sessionStorage.getItem("securityToken")), "_self");
}

function formLogin(mode) {
    sessionStorage.setItem("loginMode", mode);
    if (mode == 'login') {
        var customerEmail = document.forms["formCustomerLogin"]["loginFormEmail"].value,
        customerPassword = document.forms["formCustomerLogin"]["loginFormPassword"].value,
        data = JSON.parse('{ \
            "email": "'+customerEmail+'", \
            "password": "'+customerPassword+'" \
        }');
    } else { /* Signup */
        var customerName = document.forms["formCustomerSignup"]["signupFormName"].value,
        customerEmail = document.forms["formCustomerSignup"]["signupFormEmail"].value,
        customerPassword = document.forms["formCustomerSignup"]["signupFormPassword"].value,
        customerNewsletter = document.forms["formCustomerSignup"]["signupFormNewsletter"].value,
        data = JSON.parse('{ \
            "name": "'+customerName+'", \
            "email": "'+customerEmail+'", \
            "password": "'+customerPassword+'", \
            "newsletter": "'+customerNewsletter+'" \
        }');
    }
    /* HYASSIN: change alert */
    validateCustomerData(data, mode) ? customerLogin('form', data, mode) : alert('Wrong data format entered');
}

function parseLoginAuth() {
    var parsedUrl = new URL(window.location),
	state = parsedUrl.searchParams.get("state"),
	code = parsedUrl.searchParams.get("code");
	
    if (state && code) {
		if (state == sessionStorage.getItem("securityToken")) {
			// Authentication Confirmed => Get Google Profile Info
            getGoogleInfo(code);
		} else {
			// Authentication Not Confirmed
            // Choose to Login with e-mail & password or Signup
            /* Do Nothing */
		}
	} else {
        /* Do Nothing */
	}
}

// curl -X POST 'https://oauth2.googleapis.com/token?code=4/0AeaYSHBblOaRVIXcXv0inTQBPtjrM7b-MlJal67bRg5v3T03lCuMLI9khr0d-4j2VnvT3w&client_id=324503206928-c9vc49mtttkf4gfi5qf4qnn838p4j2fk.apps.googleusercontent.com&client_secret=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&redirect_uri=http://127.0.0.1:54218/preview/B6D4FB05-FC9D-4EE6-94D1-CEC978DA4CBF-96889-000009762F886613/Users/hyasein/Downloads/himjrnl/auth/login.html&grant_type=authorization_code' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8'
async function getGoogleInfo(code) {
    await fetch("https://oauth2.googleapis.com/token?code="+code+"&client_id="+clientId+"&client_secret="+clientSecret+"&redirect_uri="+redirectURI.href.toString()+"&grant_type=authorization_code", {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        return response.json();
    }).then((json) => {
        // retrieve customer e-mail from stripe
        let googleProfile = JSON.parse(base64URLdecode(json['id_token']));

        if (googleProfile['email_verified'] == true) {
            // email verified => Choose to Login or Signup
            // retrieve customer and compare email with stored customers
            customerLogin('google', googleProfile, sessionStorage.getItem("loginMode"));
        } else {
            alert('email not verified => Choose to Login with e-mail & password or Signup');
        }
    }).catch(() => {
        alert('Error Getting Info => Choose to Login with e-mail & password or Signup');
    });
}

function base64URLdecode(str) {
    return decodeURIComponent(atob(str.split('.')[1].replace('-', '+').replace('_', '/')).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
}

async function customerLogin(source, data, mode) {
    /***********
     * source: check if google, facebook, form
     * data: the login or signup customer profile data
     * mode: check if login or signup
     ***********/
    if (mode == 'login') {
        await retrieveCustomer(data['email']).then((customers) => {
            if (customers.length > 0) {
                switch (source) {
                    case 'facebook':
                    case 'google':
                        // retrieve customer and compare email with stored customers
                        // if customer found, login;
                        // else, show error "entered e-mail or password doesn't match our records"
                        document.dispatchEvent(new CustomEvent("customerLoggedIn", { detail: customers[0] }));
                        break;
                    case 'form':
                        // retrieve customer and compare email with stored customers
                        // if customer found, login;
                        // else, show error "entered e-mail or password doesn't match our records"
                        if (data['password'] == customers[0]['metadata']['password']) {
                            document.dispatchEvent(new CustomEvent("customerLoggedIn", { detail: customers[0] }));
                        } else {
                            alert("entered e-mail or password doesn't match our records");    
                        }
                        break;
                }
            } else {
                alert("entered credentials don't match our records");
            }
        });
    } else { // mode == signup
        switch (source) {
            case 'facebook':
            case 'google':
                // retrieve customer and compare email with stored customers
                // if customer found, show error "entered e-mail matches a member in our club, login?"
                // else, Create Customer & Continue Login Flow
                retrieveCustomer(data['email']).then((customers) => {
                    if (customers.length > 0) {
                        alert('entered e-mail matches a member in our club, login?');
                    } else {
                        alert("Create Customer & Continue Login Flow");
                        // Create Customer with name, e-mail, default profile picture and password
                        // Save customerId
                        // prepareCheckoutSession with customerId
                        // listen for success webhook, then return to profile
                        // otherwise, ...
                    }
                });
                break;
            case 'form':
                // retrieve customer and compare email with stored customers
                // if customer found, show error show error "entered e-mail matches a member in our club, login?";
                // else, Create Customer & Continue Login Flow
                const customerData = JSON.parse('{ \
                    "name": "HESHAM ELLETEZ", \
                    "email": "elletez@gmail.com", \
                    "metadata": { \
                        "password": "elletez", \
                        "newsletterSubscription": "true", \
                        "profilePicture": "'+domain+"/resources/pics/HiMIcon.png"+'" \
                    } \
                }');
                prepareCheckoutForm(customerData);
                /* HYASSIN: TO DO - Uncomment */
                /* retrieveCustomer(data['email']).then((customers) => {
                    if (customers.length > 0) {
                        // HYASSIN: TO DO - Change alert
                        alert('entered e-mail matches a member in our club, login?');
                    } else {
                        const customerData = JSON.parse('{ \
                            "name": "'+data['name']+'", \
                            "email": "'+data['email']+'", \
                            "metadata": { \
                                "password": "'+data['password']+'", \
                                "newsletterSubscription": "'+data['newsletter']+'", \
                                "profilePicture": "'+domain+"/resources/pics/HiMIcon.png"+'" \
                            } \
                        }');
                        // Create Customer with name, e-mail, default profile picture and password
                        createNewCustomer(customerData).then((customer) => {
                            // Save customer & login
                            localStorage.setItem('customerLoggedIn', true);
                            localStorage.setItem('customerProfile', JSON.stringify(customer));
                            // prepareCheckoutSession with customerId
                            prepareCheckoutForm(customer);
                            // listen for success webhook, then return to profile
                            // otherwise, ...
                        });
                    }
                }); */
                break;
        }
    }
}

async function createNewCustomer(customerData) {
    return await createCustomer(customerData).then((customer) => {
        return customer;
    });
}

async function prepareCheckoutForm(customer) {
    const price = await listPrices().then(priceItem => {
        return priceItem[0];
    });
    
    /* HYASEIN: Get as Input */
    /* const customer = await retrieveCustomer(customerElement['email']).then(customers => {
        if (customers.length > 0) {
            return customers[0];
        } else {
            alert('error')
        }
    }); */

    var checkoutFormInput = '{\
        "customer": '+JSON.stringify(customer)+',\
        "domain": "'+domain+"/auth/login.html?session_id={CHECKOUT_SESSION_ID}"+'",\
        "mode": "subscription",\
        "uiMode": "embedded",\
        "price": "'+price["id"]+'"\
    }';

    // Call Checkout
    window.open(domain + "/auth/subscription.html?checkout=" + btoa(checkoutFormInput), "_self")
}

async function checkoutMain() {
    
    initializeMagazine();

    const checkout = await parseCheckoutFormData();

    // Mount Checkout
    checkout.mount('#checkout');
}

async function parseCheckoutFormData() {
    const parsedUrl = new URL(decodeURIComponent(window.location));
    
    const checkoutFormInput = JSON.parse(window.atob(parsedUrl.searchParams.get("checkout")));
	
    return await initializePaymentServer(checkoutFormInput);
}

/********************************************************************
 ****************** Handle User Account Management *****************
********************************************************************/
/*
<label for="file"> \
    <span>Change Image</span> \
</label> \
<input type="file" onchange="loadFile(event)"/> \
*/
function prepareProfile() {
    const profileCard = document.getElementById('profileCard');
    const profileName = JSON.parse(localStorage.getItem('customerProfile'))['name'] != null ? JSON.parse(localStorage.getItem('customerProfile'))['name'] : '';
    const profileEmail = JSON.parse(localStorage.getItem('customerProfile'))['email'] != null ? JSON.parse(localStorage.getItem('customerProfile'))['email'] : '';
    const profileAddress = JSON.parse(localStorage.getItem('customerProfile'))['address'] != null ? JSON.parse(localStorage.getItem('customerProfile'))['address']['line1']+', '
    +JSON.parse(localStorage.getItem('customerProfile'))['address']['postal_code']+' '
    +JSON.parse(localStorage.getItem('customerProfile'))['address']['city']+', '
    +JSON.parse(localStorage.getItem('customerProfile'))['address']['country'] : '';
    const profilePhone = JSON.parse(localStorage.getItem('customerProfile'))['phone'] != null ? JSON.parse(localStorage.getItem('customerProfile'))['phone'] : '';
    /* HYASSIN: TO DO - get the image from customer */
    const saveProfile = $(' \
    <div class="row justify-content-center" style="z-index: 1 !important;"> \
        <div class="col-lg-3 order-lg-2"> \
            <div class="card-profile-image"> \
                    <img id="profilePicture" src="https://demos.creative-tim.com/argon-dashboard/assets-old/img/theme/team-4.jpg" class="rounded-circle"> \
            </div> \
        </div> \
    </div> \
    <div class="card-header bg-white border-0"> \
        <div class="row align-items-center"> \
            <div class="col-8"> \
                <h3 class="mb-0">'+profileName+'</h3> \
            </div> \
            <div class="col-4 text-right"> \
                <a href="javascript:prepareProfile()" class="btn btn-sm btn-primary">Edit Profile</a> \
            </div> \
        </div> \
    </div> \
    <div id="editSaveProfile" class="card-body"> \
        <form> \
            <hr class="my-4"> \
            <!-- Billing Information --> \
            <h6 class="heading-small text-muted mb-4">Billing information</h6> \
            <div class="row"> \
                <div class="col-lg-6"> \
                    <div class="form-group"> \
                        <label class="form-control-label">Name: </label> \
                        <label id="label-name" class="form-control-label">'+profileName+'</label> \
                    </div> \
                </div> \
                <div class="col-lg-6"> \
                    <div class="form-group"> \
                        <label class="form-control-label">Address: </label> \
                        <label id="label-address" class="form-control-label">'+profileAddress+'</label> \
                    </div> \
                </div> \
                <div class="col-lg-6"> \
                    <div class="form-group"> \
                        <label class="form-control-label">Phone: </label> \
                        <label id="label-address-phone" class="form-control-label">'+profilePhone+'</label> \
                    </div> \
                </div> \
            </div> \
            <hr class="my-4"> \
            <!-- User Information --> \
            <h6 class="heading-small text-muted mb-4">User information</h6> \
            <div class="pl-lg-4"> \
                <div class="row"> \
                    <div class="col-lg-6"> \
                        <div class="form-group"> \
                            <label class="form-control-label">Email address: </label> \
                            <label id="label-email" class="form-control-label">'+profileEmail+'</label> \
                        </div> \
                    </div> \
                </div> \
            </div> \
            <hr class="my-4"> \
            <!-- Subscription Information --> \
            <h6 class="heading-small text-muted mb-4">Subscription Management</h6> \
            <div class="row"> \
                <div class="col-lg-6"> \
                    <div class="form-group focused"> \
                        <span class="input-group no-border"> \
                            <h2 class="card-title">Update your Subscription and Billing Information</h1> <!--title-up--> \
                            <a href="javascript:goToCustomerPortal()" style="position: relative;align-items: center;color: #111F4A;cursor: pointer;display: inline-flex;padding-left: 0.5em;font-weight: 200;font-family: Chronicle Display Roman;font-size: 1em;font-style: normal;align-self: stretch;">on Stripe!</a> \
                        </span> \
                    </div> \
                </div> \
            </div> \
        </form> \
    </div> \
    ');
    const editProfile = $(' \
    <div class="row justify-content-center" style="z-index: 1 !important;"> \
        <div class="col-lg-3 order-lg-2"> \
            <div class="card-profile-image" onClick="changeProfilePicture()"> \
            <img id="profilePicture" src="https://demos.creative-tim.com/argon-dashboard/assets-old/img/theme/team-4.jpg" class="rounded-circle"> \
            <div class="overlay"> \
                    <i class="fas fa-camera"></i> \
                </div> \
            </div> \
        </div> \
    </div> \
    <div class="card-header bg-white border-0"> \
        <div class="row align-items-center"> \
            <div class="col-8"> \
                <h3 class="mb-0">'+profileName+'</h3> \
            </div> \
            <div class="col-4 text-right"> \
                <a href="javascript:saveProfile()" class="btn btn-sm btn-primary">Save Profile</a> \
            </div> \
        </div> \
    </div> \
    <div id="editSaveProfile" class="card-body"> \
        <form> \
            <hr class="my-4"> \
            <!-- Billing Information --> \
            <h6 class="heading-small text-muted mb-4">Billing information</h6> \
            <div class="row"> \
                <div class="col-md-12"> \
                    <div class="form-group focused"> \
                        <div id="address-element"> \
                            <!-- Elements will create form elements here --> \
                        </div> \
                    </div> \
                </div> \
            </div> \
            <hr class="my-4"> \
            <!-- User Information --> \
            <h6 class="heading-small text-muted mb-4">User information</h6> \
            <div class="pl-lg-4"> \
                <div class="row"> \
                    <div class="col-lg-6"> \
                        <div class="form-group"> \
                            <label class="form-control-label" for="input-email">Email address</label> \
                            <input type="email" id="input-email" class="form-control form-control-alternative" value='+profileEmail+'> \
                        </div> \
                    </div> \
                    <div class="col-lg-6"> \
                        <div class="form-group focused"> \
                            <label class="form-control-label">Old password</label> \
                            <input type="password" id="input-old-password" class="form-control form-control-alternative" placeholder="Old Password"> \
                        </div> \
                    </div> \
                    <div class="col-lg-6"> \
                        <div class="form-group focused"> \
                            <label class="form-control-label">New password</label> \
                            <input type="password" id="input-new-password" class="form-control form-control-alternative" placeholder="New Password"> \
                        </div> \
                    </div> \
                    <div class="col-lg-6"> \
                        <div class="form-group focused"> \
                            <label class="form-control-label">Confirm new password</label> \
                            <input type="password" id="input-confirm-new-password" class="form-control form-control-alternative" placeholder="Confirm New Password"> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        </form> \
    </div> \
    ');

    /* Prepare address element default values */
    if (JSON.parse(localStorage.getItem('customerProfile'))['address'] == null) {
        if (JSON.parse(localStorage.getItem('customerProfile'))['phone'] == null) {
            var addressDefaultValues = JSON.parse('{ \
                "name": "'+JSON.parse(localStorage.getItem('customerProfile'))['name']+'" \
            }');
        } else {
            var addressDefaultValues = JSON.parse('{ \
                "name": "'+JSON.parse(localStorage.getItem('customerProfile'))['name']+'", \
                "phone": "'+JSON.parse(localStorage.getItem('customerProfile'))['phone']+'" \
            }');
        }
    } else {
        if (JSON.parse(localStorage.getItem('customerProfile'))['phone'] == null) {
            var addressDefaultValues = {
                "name": JSON.parse(localStorage.getItem('customerProfile'))['name'],
                "address": {
                    "line1": JSON.parse(localStorage.getItem('customerProfile'))['address']['line1'],
                    "line2": JSON.parse(localStorage.getItem('customerProfile'))['address']['line2'],
                    "city": JSON.parse(localStorage.getItem('customerProfile'))['address']['city'],
                    "state": JSON.parse(localStorage.getItem('customerProfile'))['address']['state'],
                    "postal_code": JSON.parse(localStorage.getItem('customerProfile'))['address']['postal_code'],
                    "country": JSON.parse(localStorage.getItem('customerProfile'))['address']['country']
                }
            };
        } else {
            var addressDefaultValues = {
                "name": JSON.parse(localStorage.getItem('customerProfile'))['name'],
                "phone": JSON.parse(localStorage.getItem('customerProfile'))['phone'],
                "address": {
                    "line1": JSON.parse(localStorage.getItem('customerProfile'))['address']['line1'],
                    "line2": JSON.parse(localStorage.getItem('customerProfile'))['address']['line2'],
                    "city": JSON.parse(localStorage.getItem('customerProfile'))['address']['city'],
                    "state": JSON.parse(localStorage.getItem('customerProfile'))['address']['state'],
                    "postal_code": JSON.parse(localStorage.getItem('customerProfile'))['address']['postal_code'],
                    "country": JSON.parse(localStorage.getItem('customerProfile'))['address']['country']
                }
            };
        }
    };
    
    if (!elements.getElement("address")) {
        addressElement = elements.create("address", {
            mode: "billing",
            fields: {
                phone: 'always',
            },
            defaultValues: addressDefaultValues,
            validation: {
                phone: {
                    required: 'never',
                },
            }
        });
    }

    if (profileCard.classList.contains('edit')) {
        profileCard.innerHTML = '';
        editProfile.appendTo(profileCard);
        profileCard.classList.replace('edit', 'save');
        addressElement.mount("#address-element");
        listenToChanges();
    } else if (profileCard.classList.contains('save')) {
        profileCard.innerHTML = '';
        saveProfile.appendTo(profileCard);
        profileCard.classList.replace('save', 'edit');
        addressElement.unmount();
    } else {
        profileCard.innerHTML = '';
        saveProfile.appendTo(profileCard);
        profileCard.classList.add('edit');
    }
}

function changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event) => {
        const reader = new FileReader();
        const file = event.target.files[0];
        reader.onload = (e) => {
            const img = document.getElementById('profilePicture');
            img.src = e.target.result;
            profilePictureChange['data'] = e.target.result;
            profilePictureChange['change'] = true;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function listenToChanges() {
    elements.getElement("address").on('change', async () => {
        const {complete, value} = await elements.getElement("address").getValue();
        
        if (complete) {
            addressChange['data'] = value;
            addressChange['change'] = true;
        }
    });

    document.getElementById("input-email").onchange = () => {
        const email = document.getElementById("input-email").value;
        if (validateCustomerData(email, 'email')) {
            emailChange['data'] = email;
            emailChange['change'] = true;
        } else {
            alert('Input doesn´t match e-mail format');
        }
    };

    document.getElementById("input-old-password").onchange = () => {
        oldPasswordChange['data'] = document.getElementById("input-old-password").value;
        oldPasswordChange['change'] = true;
    }
    
    document.getElementById("input-new-password").onchange = () => {
        const newPassword = document.getElementById("input-new-password").value;
        if (oldPasswordChange['change'] && newPassword != oldPasswordChange['data']) {
            if (validateCustomerData(newPassword, 'password')) {
                newPasswordChange['data'] = newPassword;
                newPasswordChange['change'] = true;
            } else {
                alert('New Password isn\'t Valid');
            }
        } else {
            alert('New Password can\'t be same as Old Password');
        }
    }
    
    document.getElementById("input-confirm-new-password").onchange = () => {
        const confirmNewPassword = document.getElementById("input-confirm-new-password").value;
        if (newPasswordChange['change'] && confirmNewPassword == newPasswordChange['data']) {
            confirmNewPasswordChange['data'] = confirmNewPassword;
            confirmNewPasswordChange['change'] = true;
        } else {
            alert('Confirm Password doesn\'t match New Password')
        }
    }
}

function saveProfile() {
    var updateData = JSON.parse('{ \
        "name": "'+JSON.parse(localStorage.getItem('customerProfile'))['name']+'", \
        "email": "'+JSON.parse(localStorage.getItem('customerProfile'))['email']+'", \
        "phone": "'+JSON.parse(localStorage.getItem('customerProfile'))['phone']+'", \
        "metadata": '+JSON.stringify(JSON.parse('{ \
            "password": "'+JSON.parse(localStorage.getItem('customerProfile'))['metadata']['password']+'", \
            "newsletterSubscription": "'+JSON.parse(localStorage.getItem('customerProfile'))['metadata']['newsletterSubscription']+'", \
            "profilePicture": "'+JSON.parse(localStorage.getItem('customerProfile'))['metadata']['profilePicture']+'" \
        }'))+', \
        "address": '+JSON.stringify(JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem('customerProfile'))['address']), (key, value) => value === null ? "": value))+', \
        "shipping": '+JSON.stringify(JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem('customerProfile'))['shipping']), (key, value) => value === null ? "": value))+' \
    }');
    
    if (profilePictureChange['change']) {
        updateData['metadata']['profilePicture'] = profilePictureChange['data']
    } else {
        /* Do Nothing */
    }

    if (emailChange['change']) {
        updateData['email'] = emailChange['data'];
    } else {
        /* Do Nothing */
    }

    if (confirmNewPasswordChange['change']) {
        if (oldPasswordChange['data'] == JSON.parse(localStorage.getItem('customerProfile'))['metadata']['password']) {
            updateData['metadata']['password'] = newPasswordChange['data'];
        } else {
            alert('Old password doesn´t match our records');
        }
    } else {
        /* Do Nothing */
    }

    if (addressChange['change']) {
        // Get Fields
        const address = addressChange['data']['address'];
        const name = addressChange['data']['name'];
        const phone = addressChange['data']['phone'];
        
        // Prepare updateData
        updateData['name'] = name;
        updateData['phone'] = phone;
        updateData['address'] = JSON.parse(JSON.stringify(address), (key, value) => value === null ? "": value);
    } else {
        /* Do Nothing */
    }

    // Update Customer
    updateCustomer(JSON.parse(localStorage.getItem('customerProfile'))['id'], updateData).then((customer) => {
        localStorage.setItem('customerProfile', JSON.stringify(customer));
        prepareProfile();
    }).catch((error) => {
        alert('Failed to update profile due to the following error: ' + error);
    });
}

function validateCustomerData(data, mode) {
    if (mode == 'login') {
        return data['email'].match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
        (data['password'] != '');
    } else if (mode == 'signup') {
        return data['name'].match(/(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})/) &&
        data['email'].match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
        (data['password'] != '');
    } else if (mode == 'email') {
        return data.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    } else if (mode == 'password') {
        return data.match(/^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/);
    }
}

function goToCustomerPortal() {
    var customerId = JSON.parse(localStorage.getItem('customerProfile'))['id'];
    
    if (customerId != null) {
        createPortalSession(customerId, domain + "/auth/profile.html").then((customerPortalSession) => {
            window.open(customerPortalSession['url'], "_self");
        });
    }
}  