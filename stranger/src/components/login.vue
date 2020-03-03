<template>
  <div class="login">
        <div class="logo">
            <img v-lazy=" logo " alt="logo">
        </div>
        <p class="title">陌生人管理系统</p>
        
        <div class="login-form">
            <el-form>
                <!--账号密码登录-->
                <el-form-item style="border-bottom: 1px  #CCCCCC solid;">
                    <el-input style="border: none;" type="text" v-model=" form_user.hotel_code " placeholder="集团代码"></el-input>
                </el-form-item>

                <!-- 用户姓名 -->
                <el-form-item style="border-bottom: 1px  #CCCCCC solid;" >
                    <el-input style="border: none;" type="text" v-model=" form_user.userName " placeholder="用户名/手机号"></el-input>
                </el-form-item>

                <!-- 登录密码 -->
                <el-form-item style="border-bottom: 1px  #CCCCCC solid;" >
                    <el-input style="border: none;" type="password" v-model=" form_user.passWord " placeholder="密码"></el-input>
                </el-form-item>

                <!-- 是否记住密码 --> 
                <el-checkbox v-model=" form_user.checked ">记住密码</el-checkbox> 
            </el-form>

        </div>
        <div class="login-btn" @click="login_user()">登 录</div>
  </div>
</template>

<script>
import md5 from '@/js/md5.js'; 

export default {
  name: 'login',
  data () {
    return {
      logo: require('@/assets/logo.png'),
      /* 
        *用户名 form 表单
      */
      form_user:{
          hotel_code: 'SHJKJD',
          userName: '',
          passWord: '', 
          checked: false
        },
    }
  },
  created(){
    let userLogin = localStorage.getItem('userLogin'); 
    // console.log(userLogin);
    if(userLogin){
      this.form_user = JSON.parse(userLogin);
    }
    
  },
  methods:{
      /* 
        跳转路由 
    */
    navigate(router) {
      this.$router.push({ path: router });
    },
    /* 
        *登录
    */
    login_user(){
      let url = this.$api.api_login + 'common/employee/login',that = this; 

      if( that.form_user.userName.trim().length > 0 &&  that.form_user.passWord.trim().length > 0 ){
        let params = {
                  'code': that.form_user.hotel_code,
                  'user_name': that.form_user.userName,
                  'password': md5.hexMD5(that.form_user.passWord),
                  'shift_id': ''
                };
        if(that.form_user.checked){
          localStorage.setItem('userLogin', JSON.stringify(that.form_user));
        }

        that.$axios.post(url,params).then(function(res) { 
          // console.log( res.data );
          if(res.data.message == 'success'){
            localStorage.setItem('hotelInfo', JSON.stringify(res.data.user_info));
            that.navigate('/index');

          }else{
            that.$message.error('登录失败，失败原因：' + res.data.message);
          } 
        }).catch(error => { 

        });
      }
      

            
      

    }
  },
}
</script>
<style>
.el-input__inner{
    border: none;
}
</style>
<style scoped>
.login{
    width: 50%; 
    margin: auto; 
}
.logo{
    width: 77px;
    height: 88px;
    margin: 100px auto 20px auto;
}
.title{
    font-size: 20px;
    text-align: center;
}
/* login-form */
.login-form{
    margin: 30px auto;
}
/* 登录 */
.login-btn{
    margin: 20px auto;
    font-size: 16px;
    text-align: center;
    background-color: #46A0FC;
    color: #ffffff;
    line-height: 40px;
    cursor: pointer;
}
</style>
