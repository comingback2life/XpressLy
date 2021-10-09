const signInBtn = document.querySelector('#sign-in-btn'); 
const signUpBtn = document.querySelector('#sign-up-btn'); 
const container = document.querySelector('.container');

signUpBtn.addEventListener('click', () =>{
    container.classList.add('sign-up-mode');
});

signInBtn.addEventListener('click', () =>{
    container.classList.remove('sign-up-mode');
});

document.querySelector('#link-signup-org').addEventListener('click', e =>{
    e.preventDefault();
    container.classList.add('sign-up-mode-org');
    container.classList.remove('sign-up-mode');
    container.classList.remove('sign-up-mode-vendor');
    signUpBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-org');
        container.classList.add('sign-up-mode');
        container.classList.remove('sign-up-mode-vendor');
    });
    signInBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-org');
        container.classList.remove('sign-up-mode');
        container.classList.remove('sign-up-mode-vendor');
    });
});

document.querySelector('#link-signup-vendor-org').addEventListener('click', e =>{
    e.preventDefault();
    container.classList.add('sign-up-mode-org');
    container.classList.remove('sign-up-mode');
    container.classList.remove('sign-up-mode-vendor');
    signUpBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-org');
        container.classList.add('sign-up-mode');
        container.classList.remove('sign-up-mode-vendor');
    });
    signInBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-org');
        container.classList.remove('sign-up-mode');
        container.classList.remove('sign-up-mode-vendor');
    });
});


document.querySelector('#link-signup-vendor').addEventListener('click', e =>{
    e.preventDefault();
    container.classList.add('sign-up-mode-vendor');
    container.classList.remove('sign-up-mode');
    container.classList.remove('sign-up-mode-org');
    signUpBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-vendor');
        container.classList.add('sign-up-mode');
        container.classList.remove('sign-up-mode-org');
    });
    signInBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-vendor');
        container.classList.remove('sign-up-mode');
        container.classList.remove('sign-up-mode-org');
    });
});

document.querySelector('#link-signup-org-vendor').addEventListener('click', e =>{
    e.preventDefault();
    container.classList.add('sign-up-mode-vendor');
    container.classList.remove('sign-up-mode');
    container.classList.remove('sign-up-mode-org');
    signUpBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-vendor');
        container.classList.add('sign-up-mode');
        container.classList.remove('sign-up-mode-org');
    });
    signInBtn.addEventListener('click', () =>{
        container.classList.remove('sign-up-mode-vendor');
        container.classList.remove('sign-up-mode');
        container.classList.remove('sign-up-mode-org');
    });
});


document.querySelector('#link-signup').addEventListener('click', e =>{
    e.preventDefault();
    container.classList.add('sign-up-mode');
    container.classList.remove('sign-up-mode-org');
    container.classList.remove('sign-up-mode-vendor');
});



document.querySelector('#link-signup-vendor-individual').addEventListener('click', e =>{
    e.preventDefault();
    container.classList.add('sign-up-mode');
    container.classList.remove('sign-up-mode-org');
    container.classList.remove('sign-up-mode-vendor');
});
