const posts = [
    {
      id: 1,
      avatar: "pics/koreangirls.jpg",
      user: "@reddcinema",
      timestamp: "3 mins ago",
      date: "Feb 28, 2025 3:56 PM",
      image: "pics/20.jpg",
      content: "Right yall, I’ve been dating a 36 year old for almost 6 months. I turn 20 in 5 days. How do I tell my parents about it? Have I mentioned he lives 5 states away? 💀💀",
    }
  ];



function renderHomepage() {
    const postContainer = document.getElementById("flyer");
    postContainer.innerHTML = "";

    posts.forEach(post => {
        const postHTML = `
             <div class="poster">
          <div class="cust-name"> 
            <div class="heading">
              <div class="small-photo1">
                <a class="lino" href="Retail-Desktop-OtherUsers.html"><img class="small-photo" src="${post.avatar}" loading="lazy"></a>
                
              </div>
              <div class="pos">
                <div>
                  <div class="link-wrapper">
                    <a class="home-click">
                      <div class="post1">
                        <div class="jerr">
                          <p class="jerry">${post.user}</p>
                        </div>
                        <div>
                          <img class="verify" src="pics/verifi1.png">
                        </div>
                      </div>
                    </a>
                   
                  </div> 
                </div>     
                <div class="comp1">
                  <div class="cll">
                    <p class="time">${post.timestamp}</p>
                    <div class="tool">
                      <p>7.23pm &#183; Sept 23, 2024 </p>
                    </div> 
                  </div>
                 
                  
                   
                </div>
              </div> 
            </div>
            <div class="dots">
              <img class="dot" src="pics/duta.png">
              <div class="tool">
                <p>More</p>
              </div> 
            </div>      
          </div>
          <div class="laptop1">
            <img class="laptop" src="${post.image}" loading= "lazy">
             
          </div>
          <div class="tir">
            <p class="tired">${post.content}<br>

            <a class="home-click reer see-more" data-id="${post.id}">see more</a></p>
          </div>
          <div class="lefto">
            <div class="dick">
              <div>
                <img class="lefti" src="pics/lefti.png">
              </div>
             <div>
              <p class="viewe">View all 142 dives</p>
             </div>
            </div>
            <div class="twits">
              <div>
                <img class="lefti" src="pics/stats.png">
              </div>
              <div>
                <p class="viewe">96.8K views</p>
               </div>
            </div>
          </div>
          <div class="reaction">
            <div class="lovi">
              <div class="emoji-container">
      <div class="emoji-wrapper" data-count="0">
          <img src="pics/lovv.png" alt="Like" class="emoji" data-static="pics/lovv.png" data-animated="pics/lovv.png">
          <div class="emoji-count">560</div>
      </div>
      <div class="emoji-wrapper" data-count="0">
          <img src="pics/21[1].png" alt="Love" class="emoji" data-static="pics/21[1].png" data-animated="pics/2.gif">
          <div class="emoji-count">21</div>
      </div>
      <div class="emoji-wrapper" data-count="0">
          <img src="pics/angry.gif" alt="Laugh" class="emoji" data-static="pics/angry.gif" data-animated="pics/angr.gif">
          <div class="emoji-count">78</div>
      </div>
  </div>
              
                
              <div class="share1">
                <div>
                  <img class="sharo" src="pics/plu.png">
                </div> 
              </div>
            </div>
            <div class="wish1">
              <img class="twito" src="pics/twito.png">
            </div>            
          </div>
          
        </div>
        `;

        postContainer.innerHTML += postHTML;
    });
}
renderHomepage();