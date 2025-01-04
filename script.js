import { galleryItems } from './data.js';

document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger)
    
    const gallery = document.querySelector(".gallery");
    const blurryPrev = document.querySelector(".blurry-prev");
    const projectPreview = document.querySelector(".project-preview");
    const itemCount = galleryItems.length;

    let activeItemIndex = 0;
    let isAnimating = false;

  function createSplitText(element) {
    const splitText = new SplitType(element, { types: 'lines' });
    // console.log(splitText.lines);
    element.innerHTML = "";
  
    splitText.lines.forEach((line) => {
      const lineDiv = document.createElement("div");
      lineDiv.className = "line";
      const lineSpan = document.createElement("span");
      lineSpan.textContent = line.textContent;
      lineDiv.appendChild(lineSpan);
      element.appendChild(lineDiv);
    });
  }

  const initialInfoText = document.querySelector(".info p")
  if(initialInfoText){
    createSplitText(initialInfoText);
  }

    const elemementsToAnimate = document.querySelectorAll(
        ".title h1, .info p, .line span, .credits p, .director p, .cinematographer p"
    );
    gsap.set(elemementsToAnimate,{
        y:0
    })

    for(let i = 0; i < itemCount; i++){
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item");

        if(i===0) itemDiv.classList.add("active");
        const img = document.createElement("img");
        img.src = `./assets/img${i + 1}.webp`; ////////////////////
        img.alt = galleryItems[i].title;

        itemDiv.appendChild(img);
        itemDiv.dataset.index = i;
        itemDiv.addEventListener("click",()=>handleItemClick(i))
        gallery.appendChild(itemDiv);
    }

    function createElementWithClass(tag,className){
        const element = document.createElement(tag);
        element.classList.add(className)
        return element;
    }

    function createProjectDetails(activeItem, index){
        const newProjectDetails = createElementWithClass("div","project-details");
        const detailsStructure = [
            {
                className: "title",
                tag: "h1",
                content: activeItem.title
              },
              {
                className: "info",
                tag: "p",
                content: activeItem.copy
              },
              {
                className: "credits",
                tag: "p",
                content: "Credits"
              },
              {
                className: "director",
                tag: "p",
                content: `Director: ${activeItem.director}`
              },
              {
                className: "cinematographer",
                tag: "p",
                content: `Cinematographer: ${activeItem.cinematographer}`
              },
        ]

        detailsStructure.forEach(({className,tag,content})=>{
            const div = createElementWithClass("div", className);
            const element = document.createElement(tag);
            element.textContent = content;
            div.appendChild(element);
            newProjectDetails.appendChild(div);
        })

        const projectImgDiv = createElementWithClass("div", "project-img");
        const newImg = document.createElement("img");
        newImg.src = `./assets/img${index + 1}.webp`;
        newImg.alt = activeItem.title;
        
        // Ensure image loads properly
        newImg.onload = () => {
            projectImgDiv.style.opacity = "1";
        };
        
        newImg.onerror = () => {
            console.error(`Failed to load image: ${newImg.src}`);
        };

        projectImgDiv.appendChild(newImg);
        
        return {
            newProjectDetails,
            newProjectImg: projectImgDiv,
            infoP: newProjectDetails.querySelector(".info p"),
        }
    }

    function handleItemClick(index){
        if(index === activeItemIndex || isAnimating) return;
        
        isAnimating = true;
        const activeItem = galleryItems[index];
        
        gallery.children[activeItemIndex].classList.remove("active");
        gallery.children[index].classList.add("active");
        activeItemIndex = index;
    
        const elementsToAnimate = document.querySelectorAll(
            ".title h1, .info p, .line span, .credits p, .director p, .cinematographer p"
        );

        const currentProjectImg = document.querySelector(".project-img");
        
        const timeline = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
            }
        });

        // Create and set up new blurry background
        const newBlurryImg = document.createElement("img");
        newBlurryImg.src = `./assets/img${index + 1}.webp`;
        newBlurryImg.alt = activeItem.title;
        
        gsap.set(newBlurryImg, {
            opacity: 0,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
        });

        blurryPrev.insertBefore(newBlurryImg, blurryPrev.firstChild);
        
        const currentBlurryImg = blurryPrev.querySelector("img:nth-child(2)");

        // Animation sequence
        timeline
            .to(currentBlurryImg, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => currentBlurryImg?.remove()
            })
            .to(newBlurryImg, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<")
            .to(elementsToAnimate, {
                y: -40,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                stagger: 0.02
            }, "<")
            .to(currentProjectImg, {
                opacity: 0,
                scale: 0.8,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    // Remove old elements
                    document.querySelector(".project-details")?.remove();
                    currentProjectImg?.remove();

                    // Create new elements
                    const {newProjectDetails, newProjectImg, infoP} = createProjectDetails(activeItem, index);

                    // Set initial states
                    gsap.set([newProjectDetails, newProjectImg], {
                        opacity: 0,
                        scale: 0.8
                    });

                    // Add to DOM
                    projectPreview.appendChild(newProjectDetails);
                    projectPreview.appendChild(newProjectImg);

                    createSplitText(infoP);

                    // Animate in new elements
                    gsap.to([newProjectDetails, newProjectImg], {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        ease: "power2.out",
                        stagger: 0.1
                    });

                    const newElementsToAnimate = newProjectDetails.querySelectorAll(
                        ".title h1, .info p, .line span, .credits p, .director p, .cinematographer p"
                    );

                    gsap.fromTo(newElementsToAnimate,
                        { y: 40, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            ease: "power2.out",
                            stagger: 0.03
                        }
                    );
                }
            });
    }
})
