<template>
  <div class="home">
    <div class="home theme-mode-dark">
      <!-- Header -->
      <header id="header">
        <!-- Navbar -->
        <nav class="navbar navbar-expand">
          <div class="container header">
            <!-- Navbar Brand-->
            <a class="navbar-brand" href="/">
              <img src="assets/images/logo_white.svg" alt="Scrypta" />
            </a>
            <!-- Nav holder -->
            <div class="ml-auto"></div>

            <!-- Navbar Icons -->
            <ul class="navbar-nav icons">
              <li class="nav-item social">
                <a
                  href="https://twitter.com/scryptachain"
                  target="_blank"
                  class="nav-link"
                  ><i class="icon-social-twitter ml-0"></i
                ></a>
              </li>
              <li class="nav-item">
                <a
                  href="https://github.com/scryptachain/"
                  target="_blank"
                  class="nav-link"
                  ><i class="fab fa-github"></i
                ></a>
              </li>
              <li class="nav-item">
                <a
                  href="https://t.me/scryptachain_official"
                  target="_blank"
                  class="nav-link"
                  ><i class="fab fa-telegram"></i
                ></a>
              </li>
              <li class="nav-item">
                <a href="https://scrypta.wiki" target="_blank" class="nav-link"
                  ><i class="fab fa-wikipedia-w"></i
                ></a>
              </li>
              <li class="nav-item">
                <a
                  href="https://discord.gg/8mfDRVK"
                  target="_blank"
                  class="nav-link"
                  ><i class="fab fa-discord"></i
                ></a>
              </li>
            </ul>

            <!-- Navbar Toggle -->
            <ul class="navbar-nav toggle">
              <li class="nav-item">
                <a
                  href="#"
                  class="nav-link"
                  data-toggle="modal"
                  data-target="#menu"
                >
                  <i class="icon-menu m-0"></i>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <!-- Main -->
      <section id="slider" class="section-1 hero p-0 odd featured left">
        <div class="swiper-container no-slider animation slider-h-100">
          <div class="swiper-wrapper">
            <!-- Item 1 -->
            <div class="swiper-slide slide-center">
              <img
                src="assets/images/twitter_bot.png"
                class="hero-image"
                alt="Twitter Bot"
              />
              <div class="slide-content row" data-mask-768="70">
                <div class="col-12 d-flex inner">
                  <div class="left align-self-center text-center text-md-left">
                    <h1 class="title effect-static-text">
                      Scrypta Twitter Bot
                    </h1>
                    <p class="description">
                      Here will be rainy days!<br />
                      Don't worry, only $LYRA will rain!
                    </p>
                    <a href="/twitter/login"><h2>LOGIN</h2></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </section>

      <!-- what's -->
      <section id="about" class="section-2 hero p-0 odd featured right">
        <div class="swiper-container no-slider animation slider-h-100">
          <div class="swiper-wrapper">
            <!-- Item 1 -->
            <div class="swiper-slide slide-center">
              <img
                src="/assets/images/twitter_1.png"
                class="hero-image-left"
                alt="Hero Image"
              />

              <div class="slide-content row" data-mask-768="70">
                <div class="col-12 d-flex justify-content-end inner">
                  <div class="right text-center text-md-right">
                    <h2 class="title effect-static-text">Interact<br />now!</h2>
                    <p class="description ml-auto">
                      Bot is running! Follow us on Twitter, put likes, comment,
                      quote @scryptachain and retweet and you will automatically
                      receive LYRA.
                    </p>
                    <h5 style="color: #1e50bc">
                      You can also make posts containing:<br />
                      $LYRA #scrypta #scryptachain and @scryptachain<br />
                      <a href="/#/endorsements"><h2>DISCOVER ENDORSERS</h2></a>
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </section>

      <!-- How it works -->
      <section id="how" class="section-4 odd offers featured">
        <div class="container">
          <div class="row text-center intro">
            <div class="col-12">
              <h2 class="title effect-static-text">How it works</h2>
              <p class="text-max-800">
                Follow these few steps and start earning $LYRA!
              </p>
            </div>
          </div>
          <div class="row justify-content-center text-center items">
            <div class="col-12 col-md-6 col-lg-6 item">
              <div class="card featured">
                <h2 class="icon">1.</h2>
                <h6>Follow Scrypta</h6>
                <br />
                <p>
                  The first step you have to do is follow our Twitter official
                  page at
                  <a href="https://twitter.com/scryptachain" target="_blank">
                    @scryptachain</a
                  >
                  to receive rewards in Lyra. More interaction, more rewards!
                </p>
                <br />
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-6 item">
              <div class="card">
                <h2 class="icon">2.</h2>
                <h6>Sync</h6>
                <p>
                  Sync your twitter account with the bot! Just
                  <a
                    style="font-weight: 600"
                    href="/twitter/login"
                    target="_blank"
                    >CLICK HERE</a
                  >
                  and you'll see the private key of your new Lyra address on
                  which you'll receive the rewards. You can also view all
                  details abuout your Scrypta account.
                </p>
                <br />
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-6 item">
              <div class="card">
                <h2 class="icon">3.</h2>
                <h6>
                  Import on Wallet <br />
                  <span style="font-size: 12px; font-weight: 400"
                    >(Optional but reccomended)</span
                  >
                </h6>
                <br />
                <p>
                  Import your private key in your Manent Extension (download for
                  <a
                    href="https://chrome.google.com/webstore/detail/scrypta-manent-wallet/didcemkbebjgcbblnimfajmnmedgagjf"
                    target="_blank"
                    >Chrome</a
                  >
                  or
                  <a
                    href="https://addons.mozilla.org/it/firefox/addon/scrypta-manent-wallet/"
                    target="_blank"
                    >Firefox</a
                  >) or in your desktop wallet to manage your funds. see more
                  informatione <a href="/">here</a>
                </p>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-6 item">
              <div class="card featured">
                <h2 class="icon">4.</h2>
                <h6>Make interactions</h6>
                <p>
                  Now you're able to interact with our twitter profile and
                  receive rewards! You can comment, retweet, quote
                  <a href="https://twitter.com/scryptachain" target="_blank">
                    @scryptachain</a
                  >
                  and you'll receive up to
                  <span style="color: white; font-weight: 600">3 LYRA</span>.
                  <br /><br />
                  <span style="color: #1e50bc; font-weight: 600"
                    >$LYRA #scrypta #scryptachain and @scryptachain</span
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" class="section-2 hero p-0 odd featured right">
        <div class="swiper-container no-slider animation slider-h-100">
          <div class="swiper-wrapper">
            <!-- Item 1 -->
            <div class="swiper-slide slide-center">
              <img
                src="/assets/images/twtt_post.svg"
                class="hero-image-left"
                alt="Hero Image"
                style="width: 550px"
              />

              <div class="slide-content row" data-mask-768="70">
                <div class="col-12 d-flex justify-content-end inner">
                  <div class="right text-center text-md-right">
                    <h2 class="title effect-static-text">
                      Make it<br />immutable!
                    </h2>
                    <p class="description ml-auto">
                      Do you want to save a particularly important post you saw
                      on twitter?! Do you want to immortalise an "epic fail"
                      that someone said!? Thanks to this function of the BOT you
                      can do all this and make it immutable, notarizing it on
                      blockchain.
                    </p>
                    <h5 style="color: #1e50bc">
                      You can do it righting a post on  your twitter profile like this:<br />
                      #scryptabot notarize PostLink<br />
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </section>

      <!-- Tools -->
      <section id="tools" class="section-3 highlights image-left">
        <div class="container">
          <div class="row">
            <div class="col-12 align-self-center text-center text-md-left">
              <div class="row intro">
                <div class="col-12 p-0">
                  <h2 class="title effect-static-text">Other Functions</h2>
                  <p style="color: #f5f5f5">
                    Explore other functions of Scrypta Twitter Bot. You can
                    interact with it using following commands:
                  </p>
                </div>
              </div>
              <div class="row items" style="color: #f5f5f5">
                <div class="col-12 p-0">
                  <div class="row item">
                    <div class="col-12 col-md-2 align-self-center">
                      <i class="icon fas fa-share-alt"></i>
                    </div>
                    <div class="col-12 col-md-9 align-self-center">
                      <h3 style="color: #1e50bc">
                        Endorse an @user or an #hashtag
                      </h3>
                      <p>
                        Become an endorser! You can give rewards to your
                        followers with your Lyra for each interaction with your
                        twitter profile or for your favourite #hashtags.
                        <br /><br />Share a post on twitter using either or both
                        of these commands to start raising awareness of your
                        profile!
                      </p>
                      <h5 style="color: #84a5eb">
                        #scryptabot endorse @user 1 LYRA
                      </h5>
                      <h5 style="color: #84a5eb">
                        #scryptabot endorse #bitcoin 1 LYRA
                      </h5>
                    </div>
                  </div>
                  <div class="row item">
                    <div class="col-12 col-md-2 align-self-center">
                      <i class="icon icon-social-twitter"></i>
                    </div>
                    <div class="col-12 col-md-9 align-self-center">
                      <h3 style="color: #1e50bc">Set your own address</h3>
                      <p>
                        Write a simple post with your twitter account to change
                        the address for receive rewards.
                      </p>
                      <h5 style="color: #84a5eb">
                        #scryptabot address YourLyraAddress
                      </h5>
                    </div>
                  </div>
                  <div class="row item">
                    <div class="col-12 col-md-2 align-self-center">
                      <span class="icon">@</span>
                    </div>
                    <div class="col-12 col-md-9 align-self-center">
                      <h3 style="color: #1e50bc">Send a tip</h3>
                      <p>
                        Do you want to send a tip at another user? You have just
                        write a post, tag your friend and enter an amount!
                      </p>
                      <h5 style="color: #84a5eb">#scryptabot tip @user 1</h5>
                    </div>
                  </div>
                  <div class="row item">
                    <div class="col-12 col-md-2 align-self-center">
                      <i class="icon fas fa-arrow-down"></i>
                    </div>
                    <div class="col-12 col-md-9 align-self-center">
                      <h3 style="color: #1e50bc">Withdraw</h3>
                      <p>
                        Do you want to withdraw to your local address? You have
                        just write a post like this:
                      </p>
                      <h5 style="color: #84a5eb">
                        #scryptabot withdraw YourLyraAddress amount
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- specs -->
      <section
        style="padding-top: 20px"
        id="specs"
        class="section-3 odd counter funfacts featured"
      >
        <div class="container">
          <div class="row text-center intro">
            <div class="col-12">
              <h2 class="title effect-static-text">Just few rules</h2>
              <p class="text-max-800">
                In order to receive rewards in Lyra for interactions with our
                official Twitter page, you will need to meet these requirements
                and know a few specifications.
              </p>
            </div>
          </div>
          <div
            data-aos-id="counter"
            class="row justify-content-center text-center items"
          >
            <div class="col-12 col-md-6 col-lg-2 item">
              <div data-percent="60" class="radial">
                <span></span>
              </div>
              <h6>Account age in days</h6>
            </div>
            <div class="col-12 col-md-6 col-lg-2 item">
              <div data-percent="360" class="radial">
                <span></span>
              </div>
              <h6>Minutes per interaction</h6>
            </div>
            <div class="col-12 col-md-6 col-lg-2 item">
              <div data-percent="75" class="radial">
                <span></span>
              </div>
              <h6>Minimum followers</h6>
            </div>
            <div class="col-12 col-md-6 col-lg-2 item">
              <div data-percent="4" class="radial">
                <span></span>
              </div>
              <h6>Max $LYRA each day</h6>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="odd">
        <!-- Footer [links] -->
        <section id="footer" class="footer">
          <div class="container">
            <div class="row items footer-widget">
              <div class="col-12 col-lg-3 p-0">
                <div class="row">
                  <div
                    class="branding col-12 p-3 text-center text-lg-left item"
                  >
                    <div class="brand">
                      <a href="/" class="logo">
                        <img src="assets/images/logo_white.svg" alt="Scrypta" />
                      </a>
                    </div>
                    <p>
                      Scrypta Twitter Bot is an open-source project by Scrypta
                      Foundation
                    </p>
                    <ul class="navbar-nav social share-list mt-0 ml-auto">
                      <li class="nav-item">
                        <a
                          href="https://twitter.com/scryptachain"
                          target="_blank"
                          class="nav-link"
                          ><i class="icon-social-twitter ml-0"></i
                        ></a>
                      </li>
                      <li class="nav-item">
                        <a
                          href="https://github.com/scryptachain/"
                          target="_blank"
                          class="nav-link"
                          ><i class="fab fa-github"></i
                        ></a>
                      </li>
                      <li class="nav-item">
                        <a
                          href="https://t.me/scryptachain_official"
                          target="_blank"
                          class="nav-link"
                          ><i class="fab fa-telegram"></i
                        ></a>
                      </li>
                      <li class="nav-item">
                        <a href="#" class="nav-link"
                          ><i class="fab fa-wikipedia-w"></i
                        ></a>
                      </li>
                      <li class="nav-item">
                        <a
                          href="https://discord.gg/8mfDRVK"
                          target="_blank"
                          class="nav-link"
                          ><i class="fab fa-discord"></i
                        ></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-9 p-0">
                <div class="row">
                  <div
                    class="col-12 col-lg-4 p-3 text-center text-lg-left item"
                  ></div>
                  <div
                    class="col-12 col-lg-4 p-3 text-center text-lg-left item"
                  ></div>
                  <div
                    class="col-12 col-lg-4 p-3 text-center text-lg-right item"
                  >
                    <h6 class="title">Official Websites</h6>
                    <ul class="navbar-nav">
                      <li class="nav-item">
                        <a
                          href="https://scryptachain.org/"
                          target="_blank"
                          class="nav-link"
                        >
                          Scrypta Blockchain
                        </a>
                      </li>
                      <li class="nav-item">
                        <a
                          href="http://scrypta.foundation/"
                          target="_blank"
                          class="nav-link"
                        >
                          Scrypta Foundation
                        </a>
                      </li>
                      <li class="nav-item">
                        <a
                          href="http://scryptaconsortium.org/"
                          target="_blank"
                          class="nav-link"
                        >
                          Scrypta Consortium
                        </a>
                      </li>
                      <li class="nav-item">
                        <a
                          href="https://bb.scryptachain.org/"
                          target="_blank"
                          class="nav-link"
                        >
                          Block Explorer
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Copyright -->
        <section id="copyright" class="p-3 copyright">
          <div class="container">
            <div class="row">
              <div class="col-12 col-md-6 p-3 text-center text-lg-left">
                <p>
                  Scrypta Twitter Bot is an open source project running on
                  Scrypta Blockchain.
                </p>
                <!--
                                Suggestion: Replace the text above with a description of your website.
                             -->
              </div>
              <div class="col-12 col-md-6 p-3 text-center text-lg-right">
                <p>
                  © 2021 Powered by
                  <a href="https://scrypta.foundation" target="_blank"
                    >Scrypta Foundation</a
                  >.
                </p>
              </div>
            </div>
          </div>
        </section>
      </footer>

      <!-- Modal [responsive menu] -->
      <div
        id="menu"
        class="p-0 modal fade"
        role="dialog"
        aria-labelledby="menu"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-slideout" role="document">
          <div class="modal-content full">
            <div class="modal-header" data-dismiss="modal">
              Menu <i class="icon-close"></i>
            </div>
            <div class="menu modal-body">
              <div class="row w-100">
                <div class="items p-0 col-12 text-center">
                  <!-- Append [navbar] -->
                </div>
                <div class="contacts p-0 col-12 text-center">
                  <!-- Append [navbar] -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll [to top] -->
      <div id="scroll-to-top" class="scroll-to-top">
        <a href="#header" class="smooth-anchor">
          <i class="icon-arrow-up"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
const ScryptaCore = require("@scrypta/core");
export default {
  name: "App",

  data() {
    return {
      isLogged: false,
      user: {},
      message: "Copy these Text",
      balance: 0,
      scrypta: new ScryptaCore(true),
    };
  },
  methods: {
    onCopy: function (e) {
      alert("You just copied: " + e.text);
    },
    exit() {
      localStorage.setItem("user", null);
      location.reload();
    },
  },
  async mounted() {
    window.scrollTo(0, 0);
  },
};
</script>



