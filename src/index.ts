/**
 * Created by laiyq@txtws.com on 2017/6/24.
 */
 //G框架配置
 G.setConfig({
    //请求的数据响应规范
    response: {
        //响应代码
        code: "code",
        //响应数据
        data: "content",
        //错误提示信息
        msg: "message",
        //响应是否是成功的
        isOK: function (response) {
            //兼容响应数据规范
            if((response instanceof Object) && response['status'] == 'OK' && response['content']===undefined && response['message']!==undefined) {
                response['content'] = response['message'];
                delete response['message'];
            }
            return (response instanceof Object) && response['status'] == 'OK';
        }
    },
    //数据表格的数据响应规范
    table: {
        //分页
        paging_data: "content",
        paging_total: "total"
    }
});

//侧边栏对话框
require('g-sidebar-dialog/src/css/index.less');
G.ui.SidebarDialog = require('g-sidebar-dialog');

//页面路由
let page = window.location.pathname.substr(1).replace(/^system-web\//, '');
let head = 'index';
let tail = 'index';
if (page.indexOf('/') > 0) {
    //资源地址两级及以上
    head = page.substr(0, page.indexOf('/'));
    tail = page.substr(page.indexOf('/') + 1).replace('/', '-').replace(/.html$/, '');
} else if (page) {
    //资源地址只有一级
    head = page.replace(/.html$/, '');
}
//加载页面
require("./page/" + head + '/' + tail + ".ts");
//工程样式入口地址
require('./css/index.less');