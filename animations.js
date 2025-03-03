const observerFB = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const textBlock = entry.target;
        
        if (entry.isIntersecting) {
            textBlock.classList.add('fade-in-bottom-normal');
            textBlock.classList.remove('hide');
        } 
        // else {
        //     textBlock.classList.remove('fade-in-bottom-normal');
        // }
    });
});

const observerFL = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const textBlock = entry.target;
        
        if (entry.isIntersecting) {
            textBlock.classList.remove('hide');
            textBlock.classList.add('fade-in-left-normal');
        } 
        // else {
        //     textBlock.classList.remove('fade-in-left-normal');
        // }
    });
});

const observerFR = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const textBlock = entry.target;
        
        if (entry.isIntersecting) {
            textBlock.classList.remove('hide');
            textBlock.classList.add('fade-in-right-normal');
        } 
        // else {
        //     textBlock.classList.remove('fade-in-right-normal');
        // }
    });
});

document.querySelectorAll('.fadeBottom').forEach(textBlock => {
    observerFB.observe(textBlock);
});

document.querySelectorAll('.fadeLeft').forEach(textBlock => {
    observerFL.observe(textBlock);
});

document.querySelectorAll('.fadeRight').forEach(textBlock => {
    observerFR.observe(textBlock);
});