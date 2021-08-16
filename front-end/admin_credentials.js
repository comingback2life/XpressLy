function menuToggle(){
    let toggle = document.querySelector('.toggle');
    let sideBar = document.querySelector('.side-bar');
    let main = document.querySelector('.main');
    toggle.classList.toggle('active');
    sideBar.classList.toggle('active');
    main.classList.toggle('active');
}


