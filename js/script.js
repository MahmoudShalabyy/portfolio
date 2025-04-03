const navLinks = document.querySelectorAll('header nav a');
const logolink = document.querySelector('.logo');
const sections = document.querySelectorAll('section');
const menuicon = document.querySelector('#menu-icon');
const navbar = document.querySelector('header nav');



menuicon.addEventListener('click', ()=>{
menuicon.classList.toggle('bx-x')
navbar.classList.toggle('active')

})

const activePage = ()=> {
    const header =document.querySelector('header');

    header.classList.remove('active');
    setTimeout(() => {
        header.classList.add("active");

    }, 1100);

navLinks.forEach(link => {
link.classList. remove('active');
});

sections.forEach(section => {
    section.classList. remove('active');
    });
    menuicon.classList.remove('bx-x')
    navbar.classList.remove('active')

}

navLinks.forEach((link, idx) => {
  link.addEventListener("click", () => {
    if (!link.classList.contains("active")) {
      activePage();

      link.classList.add("active");

      setTimeout(() => {
        sections[idx].classList.add("active");
      }, 100);

    }
  });
});

logolink.addEventListener('click',() =>{
    if(!navLinks[0].classList.contains('active')){
        activePage();
        navLinks[0].classList.add('active');
        
        setTimeout(() => {
            sections[0].classList.add("active");
          }, 100);
    }
})


const resumebtns=document.querySelectorAll('.resume-btn');


resumebtns.forEach((btn, idx) => {
    btn.addEventListener ('click', ()=> {
        const resumedetails=document.querySelectorAll('.resume-detail');

        resumebtns.forEach(btn => {
           btn.classList.remove('active');
        });
        btn.classList.add('active');

        resumedetails.forEach(detail => {
        detail.classList.remove('active');
        });
        resumedetails[idx].classList.add('active');
   });
});

const arrowRight = document.querySelector('.protfolio-box .navigation .arrow-right');
const arrowLeft = document.querySelector('.protfolio-box .navigation .arrow-left');

let index = 0;
const activePortfolio = () => {
  const imgSlide = document.querySelector('.protfolio-carousel .img-slide');
  const protfoliodetails =document.querySelectorAll('.protfolio-detail')

  imgSlide.style.transform = `translateX(calc(${index * -100}% - ${index * 2}rem))`;

  protfoliodetails. forEach(detail => {
     detail.classList.remove('active');
    }) ;
    protfoliodetails[index].classList.add('active');
}

arrowRight.addEventListener('click', () => {
  if (index < 4) {
    index++;
    arrowLeft.classList.remove('disabled');

  } else {
    index = 5;
    arrowRight.classList.add('disabled');
  }

  activePortfolio();
});

arrowLeft.addEventListener('click', () => {
  if (index > 1) {
    index--;
    arrowRight.classList.remove('disabled');

  } else {
    index = 0;
    arrowLeft.classList.add('disabled');

  }
  activePortfolio();
});



const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const icon = themeToggle.querySelector("i");

// تحقق من الوضع المحفوظ في Local Storage
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    icon.classList.replace("bxs-moon", "bxs-sun"); // استبدال القمر بالشمس
}

themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        icon.classList.replace("bxs-moon", "bxs-sun"); // عند التبديل للوضع الداكن
    } else {
        localStorage.setItem("theme", "light");
        icon.classList.replace("bxs-sun", "bxs-moon"); // عند التبديل للوضع الفاتح
    }
});

