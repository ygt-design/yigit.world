$(document).ready(function () {

    $(".continue").click(function (e) { 
        e.preventDefault();
        $(".mobile").hide();
    });

    $('.selectedWork').click(function (e) { 
        e.preventDefault();
        $('.projects').show();
        $('.projects').animate({
            "bottom": "0",
        }, 300);
    });

    $('.close').click(function (e) { 
        e.preventDefault();
        $('.projects').animate({
            "bottom": "-100vh",
        }, 300, function() {
            $(this).hide();
            $('.display-image').animate({
                "top": "-46.3%",
                // "opacity": 0,
            }, 200, function() {
                $(this).hide();
            });
            $('.display-info').hide();
            $('.work').removeClass('selected');
        });
    });

    $('.info').click(function (e) { 
        e.preventDefault();
        $('.info-detail').animate({
            "right": "0",
        }, 300).show();
    });

    $('.close-info').click(function (e) { 
        e.preventDefault();
        $('.info-detail').animate({
            "right": "-50vw",
        }, 300, function() {
            $(this).hide();
        });
    });

    $('.thisSite').click(function (e) { 
        e.preventDefault();
        $('.site-detail').animate({
            "left": "50%",
        }, 300).show();
    });

    $('.close-site').click(function (e) { 
        e.preventDefault();
        $('.site-detail').animate({
            "left": "-50%",
        }, 300, function() {
            $(this).hide();
        });
    });

    $('.work').hover(function () {
        var backgroundImageURL = "";
    
        if ($(this).hasClass('body')) {
            backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyOne.jpg';
        } else if ($(this).hasClass('obliterate')) {
            backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/oblt/obltOne.jpg';
        }else if ($(this).hasClass('emperor')) {
            backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/emp/empOne.jpg';
        }else if ($(this).hasClass('wood')) {
            backgroundImageURL = 'https://www.yigittoprak.com/images/woodTypeFinalIThink.jpg';
        }else if ($(this).hasClass('null')) {
            backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/null.png';
        }else if ($(this).hasClass('machine')) {
            backgroundImageURL = 'https://www.yigittoprak.com/images/Cree.JPG';
        }else if ($(this).hasClass('emperorWeb')) {
            backgroundImageURL = 'https://www.yigittoprak.com/images/laptopWeb.jpg';
        }else if ($(this).hasClass('escape')) {
            backgroundImageURL = 'https://www.yigittoprak.com/images/Map_04_page-0001.jpg';
        }else if ($(this).hasClass('factory')) {
            backgroundImageURL = 'https://www.yigittoprak.com/images/3.jpg';
        }else if ($(this).hasClass('process')) {
            backgroundImageURL = 'https://www.yigittoprak.com/images/Process.png';
        }
        
        $('.display-image').stop().css("background-image", "url('" + backgroundImageURL + "')")
            .show()
            .animate({
                "top": "46.3%",
            }, 100);
    }, function () {
        $('.display-image').stop().css({
        });
    });

    $('.work').click(function () {
        $('.work').not(this).removeClass('selected');
        $(this).addClass('selected');
    
        // Scroll to the top of .display-info
        $('.works-container').animate({ scrollTop: 100 }, 500, 'swing');    
    });
    

    // $(".body").click(function (e) { 
    //     e.preventDefault();
        
    //     var backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyOne.jpg';

    //     $('.display-image').css({
    //         "background-image": "url('" + backgroundImageURL + "')",
    //         "position": "relative",
    //         "top": "46.3%",
    //         "left": "50%",
    //         "transform": "translate(-50%, -50%)",
    //         "opacity": 1,
    //         "z-index": 9999
    //     }).show();

    //     $('.display-info').css({
    //         "display": "block",
    //         "opacity": 1,
    //     }).show();

    // });

    $(".body").click(function (e) {
        e.preventDefault();
    
        // Set the background image URL
        var backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyOne.jpg';
    
        // Set the content for the .display-info element for the 'Body' work
        var infoTitle = "Images of Body and Story";
        var infoDescription = "This archive features a diverse array of body images that serve various purposes, ranging from informative diagrams to potent symbols of revolution. The images are organized into two primary classification systems. The first system categorizes them as Literal, Semi-Literal, or Metaphorical, based on their directness in conveying ideas or the depth of underlying meanings. The second system further groups them into sub-categories, considering their intended messages and creation contexts. Additionally, the images are arranged chronologically within their respective sections, illustrating the evolution of their concepts over time. Notably, the progression of the hand image from a mere 'I was here' symbol to a lasting measurement system and eventually an emblem of the leftist movement exemplifies this evolution.";
        // Set the URLs for the additional images
        var additionalImageURLs = [
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyEight.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyNine.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodySeven.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyThree.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyTwo.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyFour.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodySix.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyFive.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/c10.jpg',
            'https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyFour.jpg',
        ];
    
        $('.display-image').css({
            "background-image": "url('" + backgroundImageURL + "')",
            "z-index": 100,
            "position": "relative",
        }).show();
    
        var additionalImagesHTML = additionalImageURLs.map(imageURL => {
            return `<img src="${imageURL}" alt="Additional Image">`;
        }).join('');
    
        // Use template literals for h1 and p elements
        var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;
    
        $('.display-info').html(contentHTML).css({
            "display": "block",
            "position": "relative",
            "opacity": 1,
        }).show();
        
    });

    $(".obliterate").click(function (e) {
        e.preventDefault();
    
        // Set the background image URL
        var backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/oblt/obltOne.jpg';
    
        // Set the content for the .display-info element for the 'Body' work
        var infoTitle = "1984 (Obliterate)";
        var infoDescription = "This archive features a diverse array of body images that serve various purposes, ranging from informative diagrams to potent symbols of revolution. The images are organized into two primary classification systems. The first system categorizes them as Literal, Semi-Literal, or Metaphorical, based on their directness in conveying ideas or the depth of underlying meanings. The second system further groups them into sub-categories, considering their intended messages and creation contexts. Additionally, the images are arranged chronologically within their respective sections, illustrating the evolution of their concepts over time. Notably, the progression of the hand image from a mere 'I was here' symbol to a lasting measurement system and eventually an emblem of the leftist movement exemplifies this evolution.";
        // Set the URLs for the additional images
        var additionalImageURLs = [
            'https://www.yigittoprak.com/imagesSecond/oblt/obltTwo.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltThree.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltFour.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltFive.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltSix.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltSeven.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltEight.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltNine.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltTen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltEleven.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltTwelve.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltThirteen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltFourteen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltFifteen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltSixteen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltSeventeen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltEighteen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltNineteen.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltTwentyOne.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltTwentyThree.jpg',
            'https://www.yigittoprak.com/imagesSecond/oblt/obltTwentyFour.jpg',
        ];
    
        $('.display-image').css({
            "background-image": "url('" + backgroundImageURL + "')",
            "z-index": 100,
            "position": "relative",
        }).show();
    
        var additionalImagesHTML = additionalImageURLs.map(imageURL => {
            return `<img src="${imageURL}" alt="Additional Image">`;
        }).join('');
    
        // Use template literals for h1 and p elements
        var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;
    
        $('.display-info').html(contentHTML).css({
            "display": "block",
            "position": "relative",
            "opacity": 1,
        }).show();
        
    });

    $(".emperor").click(function (e) {
        e.preventDefault();
    
        // Set the background image URL
        var backgroundImageURL = 'https://www.yigittoprak.com/imagesSecond/emp/empOne.jpg';
    
        // Set the content for the .display-info element for the 'Body' work
        var infoTitle = "Emperor Display";
        var infoDescription = "Emperor is a display typeface that draws inspiration from the art of stone carving, resulting in a design distinguished by sharp serifs and a captivating interplay between straight and curved strokes. Its acute serifs and balanced stroke logic, rooted in traditional aesthetics, set it apart as a striking choice. The angular yet sophisticated construction of Emperor captures attention effortlessly. Moreover, its exceptional readability at smaller sizes makes it equally suitable for captions, succinct paragraphs, and modest display headings. With an air of timeless elegance, Emperor stands as a testament to the harmonious blend of heritage and modernity in typography.";
        var additionalImageURLs = [
            'https://www.yigittoprak.com/imagesSecond/emp/empOne.jpg',
            'https://www.yigittoprak.com/imagesSecond/emp/empTwo.jpg',
            'https://www.yigittoprak.com/imagesSecond/emp/empThree.jpg',
            'https://www.yigittoprak.com/imagesSecond/emp/empFour.jpg',
            'https://www.yigittoprak.com/imagesSecond/emp/empFive.jpg',
            'https://www.yigittoprak.com/imagesSecond/emp/empSix.jpg',
            'https://www.yigittoprak.com/imagesSecond/emp/empSeven.jpg'
        ];
    
        $('.display-image').css({
            "background-image": "url('" + backgroundImageURL + "')",
            "z-index": 100,
            "position": "relative",
        }).show();
    
        var additionalImagesHTML = additionalImageURLs.map(imageURL => {
            return `<img src="${imageURL}" alt="Additional Image">`;
        }).join('');
    
        // Use template literals for h1 and p elements
        var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;
    
        $('.display-info').html(contentHTML).css({
            "display": "block",
            "position": "relative",
            "opacity": 1,
        }).show();
        
    });

    $(".wood").click(function (e) {
        e.preventDefault();
    
        // Set the background image URL
        var backgroundImageURL = 'https://www.yigittoprak.com/images/woodTypeFinalIThink.jpg';
    
        // Set the content for the .display-info element for the 'Body' work
        var infoTitle = "Wood Type";
        var infoDescription = "Embarking on the creation of a black-letter typeface marked a new chapter in my design journey, harnessing my previous typeface experience while venturing into uncharted territory. The foundational tenets of black-letter typography became my guiding light: embracing consistent stroke contrasts, crisp lines with a bold edge, and expansive, robust counters. Delving into the intricacies of flat nib pen attributes and more, I employed Glyphs software to meticulously craft the lowercase characters that form the essence of the typeface. The culmination of my efforts materialized into an interactive masterpiece - a box housing both tactile printing blocks and printed material. This dynamic creation empowers the audience to partake in their layout composition, echoing the image's final portrayal. Progressing through the box, an immersive journey through the creative process unfolds, unveiling its evolution within the very fabric of the work itself.";
        var additionalImageURLs = [
            'https://www.yigittoprak.com/images/blackletter.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodOne.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodTwo.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodThree.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodFour.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodFive.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodSix.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodSeven.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodEight.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodNine.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodTen.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodEleven.jpg',
            'https://www.yigittoprak.com/imagesSecond/wood/woodTwelve.jpg'
        ];
    
        $('.display-image').css({
            "background-image": "url('" + backgroundImageURL + "')",
            "z-index": 100,
            "position": "relative",
        }).show();
    
        var additionalImagesHTML = additionalImageURLs.map(imageURL => {
            return `<img src="${imageURL}" alt="Additional Image">`;
        }).join('');
    
        // Use template literals for h1 and p elements
        var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;
    
        $('.display-info').html(contentHTML).css({
            "display": "block",
            "position": "relative",
            "opacity": 1,
        }).show();
        
    });

    $(".machine").click(function (e) {
        e.preventDefault();
    
        // Set the background image URL
        var backgroundImageURL = 'https://www.yigittoprak.com/images/Cree.JPG';
    
        // Set the content for the .display-info element for the 'Body' work
        var infoTitle = " Dialogue With The Machine";
        var infoDescription = "Embarking on the creation of a black-letter typeface marked a new chapter in my design journey, harnessing my previous typeface experience while venturing into uncharted territory. The foundational tenets of black-letter typography became my guiding light: embracing consistent stroke contrasts, crisp lines with a bold edge, and expansive, robust counters. Delving into the intricacies of flat nib pen attributes and more, I employed Glyphs software to meticulously craft the lowercase characters that form the essence of the typeface. The culmination of my efforts materialized into an interactive masterpiece - a box housing both tactile printing blocks and printed material. This dynamic creation empowers the audience to partake in their layout composition, echoing the image's final portrayal. Progressing through the box, an immersive journey through the creative process unfolds, unveiling its evolution within the very fabric of the work itself.";
        var additionalImageURLs = [
            'https://www.yigittoprak.com/images/1C.jpg',
            'https://www.yigittoprak.com/images/3C.jpg',
            'https://www.yigittoprak.com/images/2C.jpg',
            'https://www.yigittoprak.com/images/4C.jpg'
        ];
    
        $('.display-image').css({
            "background-image": "url('" + backgroundImageURL + "')",
            "z-index": 100,
            "position": "relative",
        }).show();
    
        var additionalImagesHTML = additionalImageURLs.map(imageURL => {
            return `<img src="${imageURL}" alt="Additional Image">`;
        }).join('');
    
        // Use template literals for h1 and p elements
        var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;
    
        $('.display-info').html(contentHTML).css({
            "display": "block",
            "position": "relative",
            "opacity": 1,
        }).show();
        
    });

    $(".escape").click(function (e) {
        e.preventDefault();
    
        // Set the background image URL
        var backgroundImageURL = 'https://www.yigittoprak.com/images/MapWeb/Map_04.jpg';
    
        // Set the content for the .display-info element for the 'Body' work
        var infoTitle = "Escape Route";
        var infoDescription = "The Escape Route project endeavors to unveil a dual-perspective map, one seen through the eyes of Syrian refugees and another through our own. This ingenious artwork employs two distinct methodologies to convey its message. Notably, the foreground depicts the expanse between Suruc and Kobani, offering a tangible reference for those of us who have engaged with Syria's unfolding narrative solely from afar, shaped by media and secondary sources. By mapping out the refugees' journey, this project bridges understanding and empathy across physical and emotional distances.";
        var additionalImageURLs = [
            'https://www.yigittoprak.com/images/MapWeb/Map_04.jpg',
            'https://www.yigittoprak.com/images/MapWeb/Map_02.jpg',
            'https://www.yigittoprak.com/images/MapWeb/Map_09%20copy%203.jpg',
            'https://www.yigittoprak.com/images/MapWeb/Map_03.jpg',
            'https://www.yigittoprak.com/images/MapWeb/Map_08.jpg'
        ];
    
        $('.display-image').css({
            "background-image": "url('" + backgroundImageURL + "')",
            "z-index": 100,
            "position": "relative",
        }).show();
    
        var additionalImagesHTML = additionalImageURLs.map(imageURL => {
            return `<img src="${imageURL}" alt="Additional Image">`;
        }).join('');
    
        // Use template literals for h1 and p elements
        var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;
    
        $('.display-info').html(contentHTML).css({
            "display": "block",
            "position": "relative",
            "opacity": 1,
        }).show();
        
    });

    $(".factory").click(function (e) {
        e.preventDefault();
    
        // Set the background image URL
        var backgroundImageURL = 'https://www.yigittoprak.com/images/3.jpg';
    
        // Set the content for the .display-info element for the 'Body' work
        var infoTitle = "Factory Reset";
        var infoDescription = "'Factory Reset' stands as a collaborative digital exhibition curated by graphic design students, a testament to their ingenuity. Within this innovative showcase, the conventional boundaries of graphic design are reconsidered, fostering an environment brimming with creativity and originality. Drawing inspiration from antiquated PC interface designs, the project ingeniously revitalizes outdated elements through the lens of fundamental and juxtaposing design principles. In doing so, it not only breathes new life into relics of the computer era but also serves as a pioneering experiment in branding exploration.";
        var additionalImageURLs = [
            'https://www.yigittoprak.com/images/frImg/1.jpg',
            'https://www.yigittoprak.com/images/frImg/2.jpg',
            'https://www.yigittoprak.com/images/frImg/fr_.jpg',
            'https://www.yigittoprak.com/images/frImg/fr_l-100.jpg',
            'https://www.yigittoprak.com/images/3.jpg',
            'https://www.yigittoprak.com/images/frImg/Free%20Business%20Card%20Mockup.jpg',
            'https://www.yigittoprak.com/images/frImg/fr-100.jpg',
        ];
    
        $('.display-image').css({
            "background-image": "url('" + backgroundImageURL + "')",
            "z-index": 100,
            "position": "relative",
        }).show();
    
        var additionalImagesHTML = additionalImageURLs.map(imageURL => {
            return `<img src="${imageURL}" alt="Additional Image">`;
        }).join('');
    
        // Use template literals for h1 and p elements
        var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;
    
        $('.display-info').html(contentHTML).css({
            "display": "block",
            "position": "relative",
            "opacity": 1,
        }).show();
        
    });

    //////////////////////////// media query < 1000px ////////////////////////////

    $('.selectedWork').click(function (e) { 
        e.preventDefault();
        // Check if window width is less than 1000
        if ($(window).width() < 1000) {
            // Set z-index of .interaction-box to 99
            $('.interaction-box').css('z-index', 99);
        }
        $('.projects').show();
        $('.projects').animate({
            "bottom": "0",
        }, 300);
    });

    $('.close').click(function (e) { 
        e.preventDefault();
        // Check if window width is less than 1000
        if ($(window).width() < 1000) {
            // Reset z-index of .interaction-box to its default value
            $('.interaction-box').css('z-index', ''); // Empty value resets
        }
        // Rest of your close logic here...
    });

    // Function to update project size based on window width
    function updateProjectsSize() {
        if ($(window).width() < 1000) {
            $('.projects').css({
                'width': '30vw',
                'height': '100vh',
                'margin': '0',
            });
        } else {
            // Reset the CSS properties if the window width is greater than or equal to 1000px
            $('.projects').css({
                'width': '', // Reset to default value
                'height': '' // Reset to default value
            });
        }
    }

    if ($(window).width() < 1000) {
        $('.display-image').css({
            "top": "-46.3%",
            "opacity": 0,
        });
        $('.display-image').hide();
    }

    // Call the function on page load
    $(window).resize(function () {
        updateProjectsSize();
    });
});
