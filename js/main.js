
/* ==========================================
   MOBILE NAVIGATION MENU
========================================== */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  document.addEventListener("click", (event) => {
    if (
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}


/* ==========================================
   FAQ ACCORDION
   Open one FAQ at a time
========================================== */

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== item && other.open) {
        other.open = false;
      }
    });
  });
});


/* ==========================================
   CONTINUOUS TESTIMONIAL SLIDER
   Desktop: 3 cards
   Tablet: 2 cards
   Mobile: 1 card
========================================== */

(() => {
  const slider = document.getElementById("testimonialsSlider");
  const track = document.getElementById("testimonialsTrack");
  const pagination = document.getElementById("testimonialsPagination");

  // Stop if the testimonial section is not on this page.
  if (!slider || !track || !pagination) return;

  const originalCards = Array.from(
    track.querySelectorAll(".testimonial-item")
  );

  if (originalCards.length < 2) return;

  const prevButton = slider.querySelector(".testimonial-prev");
  const nextButton = slider.querySelector(".testimonial-next");

  let currentIndex = 0;
  let stepSize = 0;
  let autoSlide = null;
  let resizeTimer = null;
  let isAnimating = false;

  /* Create exactly one dot for each original testimonial. */

  let dots = Array.from(
    pagination.querySelectorAll(".testimonial-dot")
  );

  dots.forEach((dot, index) => {
    if (index >= originalCards.length) {
      dot.remove();
    }
  });

  dots = Array.from(
    pagination.querySelectorAll(".testimonial-dot")
  );

  while (dots.length < originalCards.length) {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "testimonial-dot";
    dot.dataset.slide = String(dots.length);
    dot.setAttribute(
      "aria-label",
      `Go to testimonial ${dots.length + 1}`
    );

    pagination.appendChild(dot);
    dots.push(dot);
  }

  /* Clone the cards for continuous forward sliding. */

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);

    clone.setAttribute("aria-hidden", "true");

    clone.querySelectorAll("a, button").forEach((element) => {
      element.setAttribute("tabindex", "-1");
    });

    track.appendChild(clone);
  });

  /* Calculate card width plus gap. */

  function getGap() {
    return parseFloat(window.getComputedStyle(track).gap) || 0;
  }

  function measureSlider() {
    const firstCard = track.querySelector(".testimonial-item");

    if (!firstCard) return;

    stepSize = firstCard.getBoundingClientRect().width + getGap();

    track.style.transition = "none";
    track.style.transform = `translateX(${-currentIndex * stepSize}px)`;

    updateDots();

    requestAnimationFrame(() => {
      track.style.transition = "";
    });
  }

  /* Highlight the active pagination dot. */

  function updateDots() {
    const activeIndex = currentIndex % originalCards.length;

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  /* Move to the requested card. */

  function moveTo(index) {
    if (isAnimating || !stepSize) return;

    isAnimating = true;
    currentIndex = index;

    track.style.transition = "transform 0.45s ease";
    track.style.transform = `translateX(${-currentIndex * stepSize}px)`;

    updateDots();
  }

  /* Next testimonial. */

  function nextSlide() {
    if (isAnimating) return;

    moveTo(currentIndex + 1);
  }

  /* Previous testimonial, including the loop back. */

  function previousSlide() {
    if (isAnimating || !stepSize) return;

    if (currentIndex === 0) {
      currentIndex = originalCards.length;

      track.style.transition = "none";
      track.style.transform = `translateX(${-currentIndex * stepSize}px)`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          moveTo(currentIndex - 1);
        });
      });
    } else {
      moveTo(currentIndex - 1);
    }
  }

  /* Reset position when the cloned first card is reached. */

  track.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform") return;

    if (currentIndex >= originalCards.length) {
      currentIndex = 0;

      track.style.transition = "none";
      track.style.transform = "translateX(0)";

      requestAnimationFrame(() => {
        track.style.transition = "";
      });
    }

    isAnimating = false;
    updateDots();
  });

  /* Arrow controls. */

  nextButton?.addEventListener("click", () => {
    stopAutoSlide();
    nextSlide();
    startAutoSlide();
  });

  prevButton?.addEventListener("click", () => {
    stopAutoSlide();
    previousSlide();
    startAutoSlide();
  });

  /* Pagination controls. */

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (index >= originalCards.length) return;

      stopAutoSlide();
      moveTo(index);
      startAutoSlide();
    });
  });

  /* Automatic sliding. */

  function startAutoSlide() {
    stopAutoSlide();

    autoSlide = window.setInterval(() => {
      if (!document.hidden && !isAnimating) {
        nextSlide();
      }
    }, 4000);
  }

  function stopAutoSlide() {
    if (autoSlide !== null) {
      window.clearInterval(autoSlide);
      autoSlide = null;
    }
  }

  /* Pause while the user interacts with the slider. */

  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);
  slider.addEventListener("focusin", stopAutoSlide);
  slider.addEventListener("focusout", startAutoSlide);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }
  });

  /* Recalculate card dimensions after resizing. */

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      currentIndex = currentIndex % originalCards.length;
      isAnimating = false;

      measureSlider();
    }, 150);
  });

  /* Initialize slider. */

  measureSlider();
  startAutoSlide();
})();






// const menuToggle = document.querySelector(".menu-toggle");
// const mainNav = document.querySelector(".main-nav");

// if (menuToggle && mainNav) {
//   menuToggle.addEventListener("click", () => {
//     const isOpen = mainNav.classList.toggle("open");
//     menuToggle.setAttribute("aria-expanded", String(isOpen));
//     menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
//   });

//   document.addEventListener("click", (event) => {
//     if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
//       mainNav.classList.remove("open");
//       menuToggle.setAttribute("aria-expanded", "false");
//       menuToggle.setAttribute("aria-label", "Open navigation");
//     }
//   });

//   document.addEventListener("keydown", (event) => {
//     if (event.key === "Escape") {
//       mainNav.classList.remove("open");
//       menuToggle.setAttribute("aria-expanded", "false");
//       menuToggle.setAttribute("aria-label", "Open navigation");
//     }
//   });

//   mainNav.querySelectorAll("a").forEach((link) => {
//     link.addEventListener("click", () => {
//       mainNav.classList.remove("open");
//       menuToggle.setAttribute("aria-expanded", "false");
//     });
//   });
// }

// const stories = [
//   {
//     initial: "A",
//     quote: "The team listened to all my concerns and explained each step with kindness. I felt supported throughout my treatment.",
//     name: "— Anitha R.",
//     role: "Patient & Survivor"
//   },
//   {
//     initial: "S",
//     quote: "I felt nervous before my first appointment, but everyone made time for my questions and helped me understand my choices.",
//     name: "— Sushma K.",
//     role: "Patient"
//   },
//   {
//     initial: "P",
//     quote: "The care team treated me with warmth and respect. Their guidance helped me and my family feel less overwhelmed.",
//     name: "— Priya M.",
//     role: "Patient & Survivor"
//   }
// ];

// let activeStory = 0;
// const avatar = document.querySelector(".testimonial-avatar");
// const quoteText = document.querySelector(".quote-text");
// const quoteName = document.querySelector(".quote-name");
// const quoteRole = document.querySelector(".testimonial-content small");
// const dots = [...document.querySelectorAll(".dot")];

// function showStory(index) {
//   activeStory = (index + stories.length) % stories.length;
//   const story = stories[activeStory];
//   if (avatar) avatar.textContent = story.initial;
//   if (quoteText) quoteText.textContent = story.quote;
//   if (quoteName) quoteName.textContent = story.name;
//   if (quoteRole) quoteRole.textContent = story.role;
//   dots.forEach((dot, i) => dot.classList.toggle("active", i === activeStory));
// }

// document.querySelector(".slider-arrow.prev")?.addEventListener("click", () => showStory(activeStory - 1));
// document.querySelector(".slider-arrow.next")?.addEventListener("click", () => showStory(activeStory + 1));
// dots.forEach((dot, index) => dot.addEventListener("click", () => showStory(index)));

// // Keep the FAQ accordion tidy: opening one answer closes the others.
// document.querySelectorAll(".faq-list details").forEach((item) => {
//   item.addEventListener("toggle", () => {
//     if (item.open) {
//       document.querySelectorAll(".faq-list details").forEach((other) => {
//         if (other !== item) other.open = false;
//       });
//     }
//   });
// });



// /* ==========================================
//    CONTINUOUS TESTIMONIAL SLIDER
// ========================================== */

// (() => {
//   const slider = document.getElementById("testimonialsSlider");
//   const track = document.getElementById("testimonialsTrack");
//   const pagination = document.getElementById("testimonialsPagination");

//   if (!slider || !track || !pagination) return;

//   const originalCards = Array.from(
//     track.querySelectorAll(".testimonial-item")
//   );

//   if (originalCards.length < 2) return;

//   const prevButton = slider.querySelector(".testimonial-prev");
//   const nextButton = slider.querySelector(".testimonial-next");
//   const dots = Array.from(
//     pagination.querySelectorAll(".testimonial-dot")
//   );

//   let currentIndex = 0;
//   let visibleCards = getVisibleCards();
//   let stepSize = 0;
//   let autoSlide = null;
//   let resizeTimer = null;
//   let isAnimating = false;

//   // Clone cards to make the carousel continuous.
//   const clones = originalCards.map((card) => {
//     const clone = card.cloneNode(true);
//     clone.setAttribute("aria-hidden", "true");
//     clone.querySelectorAll("a, button").forEach((element) => {
//       element.setAttribute("tabindex", "-1");
//     });
//     return clone;
//   });

//   clones.forEach((clone) => track.appendChild(clone));

//   function getVisibleCards() {
//     if (window.innerWidth <= 600) return 1;
//     if (window.innerWidth <= 1024) return 2;
//     return 3;
//   }

//   function getGap() {
//     return parseFloat(window.getComputedStyle(track).gap) || 0;
//   }

//   function measureSlider() {
//     visibleCards = getVisibleCards();

//     const firstCard = track.querySelector(".testimonial-item");
//     if (!firstCard) return;

//     stepSize = firstCard.getBoundingClientRect().width + getGap();

//     track.style.transition = "none";
//     track.style.transform = `translateX(${-currentIndex * stepSize}px)`;

//     updateDots();

//     requestAnimationFrame(() => {
//       track.style.transition = "";
//     });
//   }

//   function updateDots() {
//     const activeDot = currentIndex % originalCards.length;

//     dots.forEach((dot, index) => {
//       dot.classList.toggle("active", index === activeDot);
//     });
//   }

//   function moveTo(index) {
//     if (isAnimating || !stepSize) return;

//     isAnimating = true;
//     currentIndex = index;

//     track.style.transition = "transform 0.45s ease";
//     track.style.transform = `translateX(${-currentIndex * stepSize}px)`;

//     updateDots();
//   }

//   function nextSlide() {
//     if (isAnimating) return;
//     moveTo(currentIndex + 1);
//   }

//   function previousSlide() {
//     if (isAnimating) return;

//     if (currentIndex <= 0) {
//       currentIndex = originalCards.length;
//       track.style.transition = "none";
//       track.style.transform = `translateX(${-currentIndex * stepSize}px)`;

//       requestAnimationFrame(() => {
//         requestAnimationFrame(() => {
//           moveTo(currentIndex - 1);
//         });
//       });
//     } else {
//       moveTo(currentIndex - 1);
//     }
//   }

//   track.addEventListener("transitionend", (event) => {
//     if (event.propertyName !== "transform") return;

//     if (currentIndex >= originalCards.length) {
//       currentIndex = 0;
//       track.style.transition = "none";
//       track.style.transform = "translateX(0)";

//       requestAnimationFrame(() => {
//         track.style.transition = "";
//       });
//     }

//     isAnimating = false;
//     updateDots();
//   });

//   nextButton?.addEventListener("click", () => {
//     stopAutoSlide();
//     nextSlide();
//     startAutoSlide();
//   });

//   prevButton?.addEventListener("click", () => {
//     stopAutoSlide();
//     previousSlide();
//     startAutoSlide();
//   });

//   dots.forEach((dot, index) => {
//     dot.addEventListener("click", () => {
//       stopAutoSlide();
//       moveTo(index);
//       startAutoSlide();
//     });
//   });

//   function startAutoSlide() {
//     stopAutoSlide();
//     autoSlide = window.setInterval(() => {
//       if (!document.hidden) nextSlide();
//     }, 3500);
//   }

//   function stopAutoSlide() {
//     if (autoSlide !== null) {
//       window.clearInterval(autoSlide);
//       autoSlide = null;
//     }
//   }

//   slider.addEventListener("mouseenter", stopAutoSlide);
//   slider.addEventListener("mouseleave", startAutoSlide);
//   slider.addEventListener("focusin", stopAutoSlide);
//   slider.addEventListener("focusout", startAutoSlide);

//   document.addEventListener("visibilitychange", () => {
//     if (document.hidden) {
//       stopAutoSlide();
//     } else {
//       startAutoSlide();
//     }
//   });

//   window.addEventListener("resize", () => {
//     window.clearTimeout(resizeTimer);

//     resizeTimer = window.setTimeout(() => {
//       currentIndex = currentIndex % originalCards.length;
//       isAnimating = false;
//       measureSlider();
//     }, 120);
//   });

//   measureSlider();
//   startAutoSlide();
// })();
