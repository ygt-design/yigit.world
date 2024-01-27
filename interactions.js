$(document).ready(function () {
  $(".continue").click(function (e) {
    e.preventDefault();
    $(".mobile").hide();
  });

  $(".selectedWork").click(function (e) {
    e.preventDefault();
    $(".projects").show();
    $(".projects").animate(
      {
        bottom: "0",
      },
      300
    );
  });

  $(".close").click(function (e) {
    e.preventDefault();
    $(".projects").animate(
      {
        bottom: "-100vh",
      },
      300,
      function () {
        $(this).hide();
        $(".display-image").animate(
          {
            top: "-46.3%",
            // "opacity": 0,
          },
          200,
          function () {
            $(this).hide();
          }
        );
        $(".display-info").hide();
        $(".work").removeClass("selected");
      }
    );
  });

  $(".info").click(function (e) {
    e.preventDefault();
    $(".info-detail")
      .animate(
        {
          right: "0",
        },
        300
      )
      .show();
  });

  $(".close-info").click(function (e) {
    e.preventDefault();
    $(".info-detail").animate(
      {
        right: "-50vw",
      },
      300,
      function () {
        $(this).hide();
      }
    );
  });

  $(".thisSite").click(function (e) {
    e.preventDefault();
    $(".site-detail")
      .animate(
        {
          left: "50%",
        },
        300
      )
      .show();
  });

  $(".close-site").click(function (e) {
    e.preventDefault();
    $(".site-detail").animate(
      {
        left: "-50%",
      },
      300,
      function () {
        $(this).hide();
      }
    );
  });

  $(".questionInteraction").click(function (e) {
    e.preventDefault();
    $(".question-detail")
      .animate(
        {
          left: "15%",
        },
        300
      )
      .show();
  });

  $(".close-question").click(function (e) {
    e.preventDefault();
    $(".question-detail").animate(
      {
        left: "-50%",
      },
      300,
      function () {
        $(this).hide();
      }
    );
  });

  $(".work").hover(
    function () {
      var backgroundImageURL = "";

      if ($(this).hasClass("body")) {
        backgroundImageURL =
          "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyOne.jpg";
      } else if ($(this).hasClass("obliterate")) {
        backgroundImageURL =
          "https://www.yigittoprak.com/imagesSecond/oblt/obltOne.jpg";
      } else if ($(this).hasClass("emperor")) {
        backgroundImageURL =
          "https://www.yigittoprak.com/imagesSecond/emp/empOne.jpg";
      } else if ($(this).hasClass("wood")) {
        backgroundImageURL =
          "https://www.yigittoprak.com/images/woodTypeFinalIThink.jpg";
      } else if ($(this).hasClass("null")) {
        backgroundImageURL =
          "https://www.yigittoprak.com/imagesSecond/null.png";
      } else if ($(this).hasClass("machine")) {
        backgroundImageURL = "https://www.yigittoprak.com/images/Cree.JPG";
      } else if ($(this).hasClass("emperorWeb")) {
        backgroundImageURL = "https://www.yigittoprak.com/images/laptopWeb.jpg";
      } else if ($(this).hasClass("escape")) {
        backgroundImageURL =
          "https://www.yigittoprak.com/images/Map_04_page-0001.jpg";
      } else if ($(this).hasClass("factory")) {
        backgroundImageURL = "https://www.yigittoprak.com/images/3.jpg";
      } else if ($(this).hasClass("process")) {
        backgroundImageURL = "https://www.yigittoprak.com/images/Process.png";
      } else if ($(this).hasClass("type")) {
        backgroundImageURL =
          "https://d2w9rnfcy7mm78.cloudfront.net/21448126/original_f2544505fa25e2762f65304f43a37374.gif?1681835769?bc=0";
      } else if ($(this).hasClass("interview")) {
        backgroundImageURL =
          "./assets/images/interviewPublication/publicationGif.gif";
      } else if ($(this).hasClass("duckinator")) {
        backgroundImageURL = "./assets/images/duckinator/aDrawing.gif";
      }

      $(".display-image")
        .stop()
        .css({
          "background-image": "url('" + backgroundImageURL + "')",
        })
        .show()
        .animate(
          {
            top: "25vw",
          },
          100
        );
    },
    function () {
      $(".display-image").stop().css({});
    }
  );

  $(".work").click(function () {
    $(".work").not(this).removeClass("selected");
    $(this).addClass("selected");

    ///write me the code: when clicked on any work the display-image div must be shown and the background image must be changed to the image of the work clicked on and should not get effected by the hover function
    // Set the background image URL
    var backgroundImageURL =
      "https://d2w9rnfcy7mm78.cloudfront.net/21448126/original_f2544505fa25e2762f65304f43a37374.gif?1681835769?bc=0";

    // Scroll to the top of .display-info
    $(".works-container").animate({ scrollTop: 100 }, 500, "swing");
  });

  $(".body").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL =
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyOne.jpg";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Images of Body and Story";
    var infoDescription =
      "This archive features a diverse array of body images that serve various purposes, ranging from informative diagrams to potent symbols of revolution. The images are organized into two primary classification systems. <br> <br> The first system categorizes them as Literal, Semi-Literal, or Metaphorical, based on their directness in conveying ideas or the depth of underlying meanings. <br> <br> The second system further groups them into sub-categories, considering their intended messages and creation contexts. Additionally, the images are arranged chronologically within their respective sections, illustrating the evolution of their concepts over time. The progression of the hand image from a mere 'I was here' symbol to a lasting measurement system and eventually an emblem of the leftist movement exemplifies this evolution.";
    // Set the URLs for the additional images
    var additionalImageURLs = [
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyEight.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyNine.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodySeven.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyThree.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyTwo.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyFour.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodySix.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyFive.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/c10.jpg",
      "https://www.yigittoprak.com/imagesSecond/imagesOfBodyandStory/imgBodyFour.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".obliterate").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL =
      "https://www.yigittoprak.com/imagesSecond/oblt/obltOne.jpg";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "1984 (Obliterate)";
    var infoDescription =
      "Fascinated by dystopias, I've deconstructed George Orwell's book '1984' from the perspective of a designer working for THE TIMES newspaper within that dystopian world. <br> <br> The design of the newspaper provides visual clues about the aesthetic and design principles prevalent in this dystopian media. It employs a monospace font, avoids hyphenation (prioritizing functionality over aesthetics), and focuses on design solely for its functional purpose. <br> <br> Within the journal of – – –, we witness his transformation from a system-compliant individual to someone who defies the system, committing the forbidden act of independent thinking. However, the journal abruptly ends, leaving – – –'s fate and journey unresolved and shrouded in mystery.";
    // Set the URLs for the additional images
    var additionalImageURLs = [
      "https://www.yigittoprak.com/imagesSecond/oblt/obltTwo.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltThree.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltFour.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltFive.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltSix.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltSeven.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltEight.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltNine.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltTen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltEleven.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltTwelve.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltThirteen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltFourteen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltFifteen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltSixteen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltSeventeen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltEighteen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltNineteen.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltTwentyOne.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltTwentyThree.jpg",
      "https://www.yigittoprak.com/imagesSecond/oblt/obltTwentyFour.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".emperor").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL =
      "https://www.yigittoprak.com/imagesSecond/emp/empOne.jpg";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Emperor Display";
    var infoDescription =
      "Emperor is a display typeface inspired by the art of stone carving, featuring sharp serifs and a balance between straight and curved lines. Its traditional aesthetics and clear serifs make it a versatile choice for both small text and display headings. Emperor combines a timeless look with modern design principles, showcasing the fusion of heritage and contemporary typography.Emperor's angular yet refined design ensures it effortlessly captures attention while maintaining readability across various text sizes and applications.";
    var additionalImageURLs = [
      "https://www.yigittoprak.com/imagesSecond/emp/empOne.jpg",
      "https://www.yigittoprak.com/imagesSecond/emp/empTwo.jpg",
      "https://www.yigittoprak.com/imagesSecond/emp/empThree.jpg",
      "https://www.yigittoprak.com/imagesSecond/emp/empFour.jpg",
      "https://www.yigittoprak.com/imagesSecond/emp/empFive.jpg",
      "https://www.yigittoprak.com/imagesSecond/emp/empSix.jpg",
      "https://www.yigittoprak.com/imagesSecond/emp/empSeven.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".wood").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL =
      "https://www.yigittoprak.com/images/woodTypeFinalIThink.jpg";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Wood Type";
    var infoDescription =
      "Creating a black-letter typeface marked a new step in my design journey, building on previous typeface experience while exploring uncharted territory. I focused on key principles of black-letter typography, emphasizing consistent stroke contrasts, sharp lines with a bold edge, and ample, sturdy counters. Using Glyphs software, I carefully crafted the lowercase characters, which form the core of the typeface. <br><br> The final result is an interactive piece— a box housing tactile printing blocks and printed material—allowing the audience to engage in layout composition. As you explore the box, you'll journey through the creative process, witnessing its evolution within the work itself.";
    var additionalImageURLs = [
      "https://www.yigittoprak.com/images/blackletter.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodOne.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodTwo.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodThree.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodFour.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodFive.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodSix.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodSeven.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodEight.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodNine.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodTen.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodEleven.jpg",
      "https://www.yigittoprak.com/imagesSecond/wood/woodTwelve.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".interview").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL =
      "./assets/images/interviewPublication/publicationGif.gif";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Interview Publication";
    var infoDescription =
      "In the beginning of the first semester, I have interviewed the people in my thesis class. I asked them questions about their thesis and their design process. As I was interviewing my peers I realized they were mostly interested in similar topics. That is why I created a categorization system under the seven main categories people were interested in about doing their thesis.";
    var additionalImageURLs = [
      "./assets/images/interviewPublication/publicationOne.jpg",
      "./assets/images/interviewPublication/publicationTwo.jpg",
      "./assets/images/interviewPublication/publicationFour.jpg",
      "./assets/images/interviewPublication/publicationThree.jpg",
      "./assets/images/interviewPublication/publicationSix.jpg",
      "./assets/images/interviewPublication/publicationTwoAnimated.gif",
      "./assets/images/interviewPublication/publicationFive.jpg",
      "./assets/images/interviewPublication/publicationSeven.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".machine").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL = "https://www.yigittoprak.com/images/Cree.JPG";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = " Dialogue With The Machine";
    var infoDescription =
      "The poster/cover designs were created in response to Sebastian Aubin's 'Dialogue With the Machine' project, which featured the development of a monospace Cree syllabic font. A monospace font in Swampy Cree (Fort Severn) Syllabics was hand-drawn to connect the past and present. This approach contrasts and combines with Aubin's aim to change the interaction between Cree people and machines. <br> <br> The distortion in the artwork symbolizes the Cree community's transition to a daily life that includes technology and coding. Jordan Bennett's 'pi'tawita'iek: we go up river' served as an influence, shaping the concept of flow in the creative process.";
    var additionalImageURLs = [
      "https://www.yigittoprak.com/images/1C.jpg",
      "https://www.yigittoprak.com/images/3C.jpg",
      "https://www.yigittoprak.com/images/2C.jpg",
      "https://www.yigittoprak.com/images/4C.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".duckinator").click(function (e) {
    e.preventDefault();

    // Set the background media URL
    var backgroundMediaURL =
      "./assets/images/duckinator/duckinatorGifs/aniFive.gif";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Duckinator Typeface";
    var infoDescription =
      "In collaboration with Aaryan Pashine we have created the Duckinator Typeface. The machine we built in order to create the typeface offered collaborative making, each individual using an axis either by using the potentiometer and the other person using the scrolling machine to move the machine back and forth. <br><br> The machine aims to combine two separately crafted machines to make a singe machine in order to offer an alternative process for typeface design. Its primary objective is to generate creative outputs without predetermined aim, embracing the unpredictability of the machine's working process.";
    var mediaItems = [
      { type: "image", url: "./assets/images/duckinator/duckOne.jpg" },
      {
        type: "video",
        url: "./assets/images/duckinator/duckinatorProcess.mp4",
      },
      {
        type: "video",
        url: "./assets/images/duckinator/duckVideoTwo.mp4",
      },
      { type: "image", url: "./assets/images/duckinator/duckThree.jpg" },
      {
        type: "video",
        url: "./assets/images/duckinator/duckVideoOne.mp4",
      },

      {
        type: "video",
        url: "./assets/images/duckinator/duckVideoThree.mp4",
      },
      { type: "image", url: "./assets/images/duckinator/duckTwo.jpg" },
    ];

    $(".display-image")
      .css({
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    $(".display-media")
      .html("")
      .append(createMediaElement("background", backgroundMediaURL));

    var additionalMediaHTML = mediaItems
      .map((media) => {
        return createMediaElement(media.type, media.url);
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
        <h1>${infoTitle}</h1>
        <p>${infoDescription}</p>
        <div class="additional-media">${additionalMediaHTML}</div>
    `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  function createMediaElement(type, url) {
    switch (type) {
      case "image":
        return `<img  width="100%" class="media-item" src="${url}" alt="Image">`;
      case "gif":
        return `<img  width="100%" class="media-item" src="${url}" alt="GIF">`;
      case "video":
        return `<video autoplay="autoplay" playsinline loop class="media-item" width="100%" controls><source src="${url}" type="video/mp4"></video>`;
      default:
        return "";
    }
  }

  $(".type").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL =
      "https://d2w9rnfcy7mm78.cloudfront.net/21448126/original_f2544505fa25e2762f65304f43a37374.gif?1681835769?bc=0";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Type and Material";
    var infoDescription =
      "In a project spanning 26 days, I set out to create one letter daily using various materials, mediums, and programs. This challenge aimed to explore the interaction between letterforms and their chosen materials. Through this project, I discovered the range of tools and techniques available in my design toolkit, enhancing my awareness of my creative process as I crafted letters each day.";
    var additionalImageURLs = [
      "https://d2w9rnfcy7mm78.cloudfront.net/21350529/original_2df49f74c121fc1ae80ed8564fe459b3.png?1681263504?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21427598/original_f22b28452cb08e10f810c97bca11f75e.jpg?1681743793?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21429840/original_b66a05d42a0608daa70c469bf5d2ad0f.gif?1681749494?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21448126/original_f2544505fa25e2762f65304f43a37374.gif?1681835769?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21448128/original_e7ef0b24aea0420be70c22ca6c7e9d99.jpg?1681835773?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21505781/original_9a44d2611f0248b4b70fd834100a3c0c.jpg?1682185947?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21515732/original_a270b9edc47780d1da7b862e56c92460.png?1682277942?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21650691/original_56a27d0540e677f73bdd4eb219e2d26a.gif?1683045051?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21877657/original_ed4707a447b3ede425845cc7fd4a5ff9.jpg?1684354015?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21879152/original_511858729bf3d6a77814843a06b5bfa1.gif?1684360456?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21881070/original_ce04b0ec7264c7eb631d07f8b21c40ff.png?1684374299?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21881524/original_87a7eafb153719bfa9ef9bf6221e41c9.png?1684378240?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21881530/original_81e7e96bbd33ba3626a4b68fb74b0744.png?1684378314?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21882214/original_d697018a348c1789b185e5bccb124a16.gif?1684383559?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21882345/original_43429aa8c8e275016bfd58ea353939a2.gif?1684384687?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21909342/original_5e74f24a0937b2a643a25a7a3e792957.png?1684550020?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21909343/original_26a9a6976a46f3fad48fcab0fbb4f7ef.jpg?1684550023?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/21929652/original_dcf60df7456415cb255a057384b1386d.png?1684730847?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/22074064/original_980140229e63598741646dead2b7a41b.jpg?1685589474?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/22213337/original_6ee5f81d6e2a0502328bd94763f2dcac.jpg?1686526776?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/23475817/original_8f6d24f9d3596fe67fd29eedf3317d54.gif?1693936615?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/23476064/original_49db0c4ddeac147982b68581cb01a722.png?1693937277?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/23476294/original_75553d7e5d1c57353ee55ab88bf7cb5a.png?1693938022?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/23476518/original_bd801d867dc6f56a96ca6f9b158ddfdf.jpg?1693938485?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/23476750/original_97d5cb8d7e704b894a457812fcf6b3c3.jpg?1693939374?bc=0",
      "https://d2w9rnfcy7mm78.cloudfront.net/23477062/original_ee382bc0168a407edc2d359df3d06b0a.png?1693940166?bc=0",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".machine").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL = "https://www.yigittoprak.com/images/Cree.JPG";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = " Dialogue With The Machine";
    var infoDescription =
      "The poster/cover designs were created in response to Sebastian Aubin's 'Dialogue With the Machine' project, which featured the development of a monospace Cree syllabic font. A monospace font in Swampy Cree (Fort Severn) Syllabics was hand-drawn to connect the past and present. This approach contrasts and combines with Aubin's aim to change the interaction between Cree people and machines. <br> <br> The distortion in the artwork symbolizes the Cree community's transition to a daily life that includes technology and coding. Jordan Bennett's 'pi'tawita'iek: we go up river' served as an influence, shaping the concept of flow in the creative process.";
    var additionalImageURLs = [
      "https://www.yigittoprak.com/images/1C.jpg",
      "https://www.yigittoprak.com/images/3C.jpg",
      "https://www.yigittoprak.com/images/2C.jpg",
      "https://www.yigittoprak.com/images/4C.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".escape").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL =
      "https://www.yigittoprak.com/images/MapWeb/Map_04.jpg";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Escape Route";
    var infoDescription =
      "The Escape Route project aims to create a map perceived differently by Syrian refugees and us. It uses two approaches: In the foreground, it shows the distance between Suruc and Kobani to help us, who have primarily relied on media and distant sources for our understanding, comprehend the refugee journey. <br> <br> For us, it's a representation of lines and dots similar to a standard map. The background image, on the other hand, offers the same map but from a Syrian refugee's perspective. It incorporates the words 'طريق' (tariq) for road and 'وطن' (watan) for homeland in a distorted manner, symbolizing how Syrian refugees view their escape route from conflict and war.";
    var additionalImageURLs = [
      "https://www.yigittoprak.com/images/MapWeb/Map_04.jpg",
      "https://www.yigittoprak.com/images/MapWeb/Map_02.jpg",
      "https://www.yigittoprak.com/images/MapWeb/Map_09%20copy%203.jpg",
      "https://www.yigittoprak.com/images/MapWeb/Map_03.jpg",
      "https://www.yigittoprak.com/images/MapWeb/Map_08.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  $(".factory").click(function (e) {
    e.preventDefault();

    // Set the background image URL
    var backgroundImageURL = "https://www.yigittoprak.com/images/3.jpg";

    // Set the content for the .display-info element for the 'Body' work
    var infoTitle = "Factory Reset";
    var infoDescription =
      "'Factory Reset' is a collaborative digital exhibition curated by graphic design students. It challenges traditional graphic design boundaries, promoting creativity and originality. Inspired by old PC interface designs, the project updates outdated elements using fundamental design principles. It aims to revitalize computer-era relics and explore branding in an innovative way.";
    var additionalImageURLs = [
      "https://www.yigittoprak.com/images/frImg/1.jpg",
      "https://www.yigittoprak.com/images/frImg/2.jpg",
      "https://www.yigittoprak.com/images/frImg/fr_.jpg",
      "https://www.yigittoprak.com/images/frImg/fr_l-100.jpg",
      "https://www.yigittoprak.com/images/3.jpg",
      "https://www.yigittoprak.com/images/frImg/Free%20Business%20Card%20Mockup.jpg",
      "https://www.yigittoprak.com/images/frImg/fr-100.jpg",
    ];

    $(".display-image")
      .css({
        "background-image": "url('" + backgroundImageURL + "')",
        "z-index": 100,
        position: "relative",
        left: "50%",
      })
      .show();

    var additionalImagesHTML = additionalImageURLs
      .map((imageURL) => {
        return `<img src="${imageURL}" alt="Additional Image">`;
      })
      .join("");

    // Use template literals for h1 and p elements
    var contentHTML = `
            <h1>${infoTitle}</h1>
            <p>${infoDescription}</p>
            <div class="additional-images">${additionalImagesHTML}</div>
        `;

    $(".display-info")
      .html(contentHTML)
      .css({
        display: "block",
        position: "relative",
        opacity: 1,
      })
      .show();
  });

  //////////////////////////// media query < 1000px ////////////////////////////

  $(".selectedWork").click(function (e) {
    e.preventDefault();
    // Check if window width is less than 1000
    if ($(window).width() < 850) {
      // Set z-index of .interaction-box to 99
      $(".interaction-box").css("z-index", 99);
    }
    $(".projects").show();
    $(".projects").animate(
      {
        bottom: "0",
      },
      300
    );
  });

  $(".close").click(function (e) {
    e.preventDefault();
    // Check if window width is less than 1000
    if ($(window).width() < 850) {
      // Reset z-index of .interaction-box to its default value
      $(".interaction-box").css("z-index", ""); // Empty value resets
    }
  });

  // Function to update project size based on window width
  function updateProjectsSize() {
    if ($(window).width() < 850) {
      $(".projects").css({
        width: "30vw",
        height: "100vh",
        margin: "0",
      });
    } else {
      // Reset the CSS properties if the window width is greater than or equal to 1000px
      $(".projects").css({
        width: "", // Reset to default value
        height: "", // Reset to default value
      });
    }
  }

  // Call the function on page load
  $(window).resize(function () {
    updateProjectsSize();
  });
});
