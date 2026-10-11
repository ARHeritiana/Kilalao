const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'tests',testMatch:'browser.spec.cjs',timeout:60000,
 use:{baseURL:'http://127.0.0.1:4173',browserName:'chromium',headless:true},
 webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1 --directory app/src/main/assets',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
 reporter:[['list'],['html',{open:'never'}]],
});
