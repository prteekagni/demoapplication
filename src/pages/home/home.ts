import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { Http, Headers } from '@angular/http';
import * as Config from '../../config';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

import { PostpagePage } from '../postpage/postpage'
import { WordpressProvider } from '../../providers/wordpress/wordpress';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AdMobPro } from '@ionic-native/admob-pro';
import { Network } from '@ionic-native/network';
import { AppMinimize } from '@ionic-native/app-minimize';
import { App } from 'ionic-angular';



@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage{
  posts: Array<any> = new Array<any>();
  images: Array<any> = new Array<any>();
  morePagesAvailable: boolean = true;
  adddata: any;
  isdata: any;
  isConnected: boolean;
  isOnline: boolean;
  constructor(
    public navCtrl: NavController, private iab: InAppBrowser, private http: Http,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public wordpress: WordpressProvider,
    private socialSharing: SocialSharing,
    private admob: AdMobPro,
    private network: Network,
    private platform:Platform,
    private appMinimize: AppMinimize,
    public app: App,

  ) {
    this.wordpress.mySubject.subscribe(res => {
      this.isConnected = res;
    })

  
  }

  ionViewDidEnter() {
    
}
  

  ionViewWillEnter() {
  
    
    this.network.onConnect().subscribe(data => {
      console.log(data)
      if (this.isOnline == false) {
        this.doRefresh();
      }
      this.wordpress.createToast('You are online');
    }, error => console.error(error));
    
    this.network.onDisconnect().subscribe(data => {
      console.log(data)
      this.isOnline = false;
    
      this.wordpress.createToast('You are offline');
      
    }, error => console.error(error));
    
    if (this.isConnected == true) {
      
    
      if (this.admob) this.admob.createBanner({
        adId: Config.adMobIdBanner,
        position: this.admob.AD_POSITION.BOTTOM_CENTER,
        adSize: "SMART_BANNER",
        autoShow: true
      });
      if (!(this.posts.length > 0)) {
        let loading = this.loadingCtrl.create();
        loading.present();
    
        this.wordpress.getRecentPosts(1,7)
          .subscribe(data => {
            for (let post of data) {
              post.excerpt.rendered = post.excerpt.rendered.split('<a')[0] + "</p>";
              this.posts.push(post);
            }
            loading.dismiss();
          }, err => {
            this.wordpress.createToast('Unable to load news');
            loading.dismiss();
    
          });
      }
      // get ads for slider 
      this.wordpress.getAdsData().subscribe(res => {
        this.adddata = res;
        if (this.adddata.length > 0) {
          this.isdata = true;
        }
        else {
          this.isdata = true;
        }
      }, err => {
        this.wordpress.createToast('Unable to load');
      });
    }
    else {
      this.wordpress.createToast('Please connect to internet');
      
    }
    
  }



  doRefresh() {

    this.wordpress.getRecentPosts(1,7)
      .subscribe(data => {
        for (let post of data) {
          post.excerpt.rendered = post.excerpt.rendered.split('<a')[0] + "</p>";
          this.posts.push(post);
        }

      }, err => {
        this.wordpress.createToast('Unable to load news');

      });


    // setTimeout(() => {
    //   console.log('Async operation has ended');
    //   refresher.complete();
    // }, 2000);
  }

  doInfinite(infiniteScroll) {
    let page = (Math.ceil(this.posts.length / 10)) + 1;
    let loading = true;

    // return this.http.get(
    //   Config.WORDPRESS_REST_API_URL
    //   + 'posts?page=' + page)
    //   .map(res => res.json())
    //   .subscribe(data => {
    //     for (let post of data) {
    //       if (!loading) {
    //         infiniteScroll.complete();
    //       }
    //       post.excerpt.rendered = post.excerpt.rendered.split('<a')[0] + "</p>";
    //       this.posts.push(post);
    //       loading = false;
    //     }
    //   })
    this.wordpress.getRecentPosts(page, 7)
      .subscribe(data => {
        for (let post of data) {
          post.excerpt.rendered = post.excerpt.rendered.split('<a')[0] + "</p>";
          this.posts.push(post);
        }
    
      }, err => {
        this.wordpress.createToast('Unable to load news');
    
      });
    

  }
  postTapped(event, post) {
    this.navCtrl.push(PostpagePage, {
      item: post
    });
  }

  shareApplication() {
    var data;
    var message = 'Palia News now available on playstore, download it for latest news around you.';
    
    this.http.get('https://jsonstorage.net/api/items/f8ffa470-4360-4206-908b-d944b7c690a1')
      .map((res)=>res.json())
      .subscribe(res => {
       data = res;
        this.socialSharing.share(message, null, null, data.link).then(() => {
          console.log(data.link);
        }).catch(() => {
          // Sharing via email is not possible
        });
        
    },
      err => {
        console.log('unable to share link')
      }
    )
  
   
  }
  ionViewWillLeave() {
    this.admob.removeBanner();
  }
}