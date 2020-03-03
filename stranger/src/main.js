// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import axios from 'axios'
Vue.prototype.$axios = axios;

import VueLazyLoad from 'vue-lazyload';
Vue.use(VueLazyLoad,{
  error:require('@/assets/fail.png'),
  loading:require('@/assets/loading.png')
})

import Qs from 'qs';
Vue.prototype.$Qs = Qs;

import vuePicturePreview from 'vue-picture-preview'//预览图片
Vue.use(vuePicturePreview)


/* 引入css */
import '@/css/reset.css';

/* 引入api.js */
import api from '../config/api';
Vue.prototype.$api = api;

/**
 * @interceptors.request
 * @ 添加公共的请求头文件 做授权使用  这里是将所有的请求信息拦截掉，之后将最新的授权信息加到请求头里面
 */
axios.interceptors.request.use((request)=>{
  console.info('请求拿到的授权信息是：'+localStorage.getItem('authorization'))
  /**
   * undefined null '' === false
   * @type {{authorization: string}}
   */
  request.headers.common = {
    'authorization' : localStorage.getItem('authorization') ? localStorage.getItem('authorization') : '',
  };
  return request;
});
/**
* @interceptors.response
* @ 统一处理请求返回数据，根据返回的数据判断用户是不是已授权，如果是已授权的话，那就直接可以拿到授权信息，将最新的授权信息给到本地存储里面。
*/
axios.interceptors.response.use((response)=>{
  /**
   * message === success
   * @response.data.new_authorization 如果存在授权信息的话，直接将授权信息拿到
   * @response.data.message === 'authorization invalid' 如果授权失效了，那么直接返回到登陆的页面，重新登陆那最新的授权信息
   * @response ；do not get it from the back end 如果后端有接口没有返回授权信息的时候，直接给控制台打印出来提示语
   * @type {{authorization: string}}
   */
  if(response.data.new_authorization){
     localStorage.setItem('authorization',response.data.new_authorization);
     console.info('返回拿到的授权信息是：'+localStorage.getItem('authorization'));
     return response;
  }else if(response.data.message === 'authorization invalid' ){
    router.push({path:'/'});
  }else{
     console.error('do not get authorization from the back end');
     return response;
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
