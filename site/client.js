const sideNav = document.getElementById('side-nav');
const navProgress = document.getElementById('nav-progress');
const library = document.getElementById('library');
const about = document.getElementById('about');
const contact = document.getElementById('contact');
const credits = document.getElementById('credits');

const sectionsY = [0].concat(...[library, about, contact, credits].map(s => s.offsetTop));
const navLinksY = Array.from(document.querySelectorAll('.side-nav-item'))
    .map(n => n.offsetTop)
    .splice(0, 5);
const heightPerSection = window.innerHeight / (sectionsY.length + 1);
navProgress.style.top = `${navLinksY[1]}px`;
console.log(sectionsY, navLinksY);
// const data = [
//     { name: 'John', age: 30, city: 'New York' },
//     { name: 'Jane', age: 25, city: 'Los Angeles' },
//     { name: 'Mark', age: 35, city: 'Chicago' }
//   ];
  
//   const container = document.getElementById('output');
  
//   data.forEach(item => {
//     const block = document.createElement('div');
//     block.classList.add('block');
    
//     const name = document.createElement('p');
//     name.textContent = `Name: ${item.name}`;
    
//     const age = document.createElement('p');
//     age.textContent = `Age: ${item.age}`;
    
//     const city = document.createElement('p');
//     city.textContent = `City: ${item.city}`;
    
//     block.appendChild(name);
//     block.appendChild(age);
//     block.appendChild(city);
    
//     container.appendChild(block);
//   });

async function getData() {
    const res = await fetch("server.php?action=storyText");
    console.log(res);
    return await res.json()
}

window.onload = async () => {
    let someData = await getData();
    console.log(someData);
};

document.addEventListener('scroll', _ => {
    if (scrollY < 120) {
        sideNav.style.display = 'none';
        return;
    }
    sideNav.style.display = 'flex';
    const calcOpacity =  0 + (scrollY - 120) / 250;
    sideNav.style.opacity = Math.max(Math.min(calcOpacity, 0.9), 0);
    const nextSectionIdx = sectionsY.findIndex(s => scrollY < s);
    const nextSection = sectionsY[nextSectionIdx];
    const currSection = scrollY < sectionsY[0] ? 0 : sectionsY[nextSectionIdx-1];
    const scrollSectionHeight = nextSection - currSection;
    const currScrollInSection = scrollY - currSection;
    const scrollSectionPercentage = (currScrollInSection / scrollSectionHeight) * 100;
    const navProgressOffset = heightPerSection * Math.max(nextSectionIdx, 1);
    const navProgressSectionScroll = (scrollSectionPercentage / heightPerSection) * 100;
    const navProgressPos = navProgressOffset + navProgressSectionScroll;
    // navProgress.style.top = `${navProgressPos}px`;
    // console.log(nextSection, currSection, scrollY, currScrollInSection, scrollSectionPercentage, navProgressPos)
    // console.log(navProgressPos);
    // console.log(navProgressOffset, navProgressSectionScroll, scrollSectionPercentage);
    // console.log(nextSection, currSection, scrollSectionPercentage, navProgressOffset);
});
