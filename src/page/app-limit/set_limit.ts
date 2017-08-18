var _this = this;
//应用权限列表页
var limitList = $(require('raw!./limit_list.html'));
var limitVals = [];    //上一次设置的访问权限
var appSelectVals = [];
var appFunctions = [];     //上一次设置的功能权限
var schoolVal = [];
var searchVal = [];
var appInfo;
var delSpan = false;
var submited = false;
var limitListOpen = true;
var appId = [], schoolId = [], deviceType = "", funId = [], permission = [];
var form = new G.Form({
    fields: [{
        field: "selectApp:text:选择应用",
        placeholder: '-请选择-',
        readonly: true,
        tips: '设置限制的应用',
        validate: {
            required: true,
        },
        validateMessage: {
            required: '至少选择一个应用'
        },
    }, {
        field: "selectProject:text:选择对象",
        placeholder: '-请选择-',
        readonly: true,
        tips: '设置该应用限制的对象',
        validate: {
            required: true,
        },
        validateMessage: {
            required: '至少选择一个对象'
        },
    }, {
        field: "deviceType:checkbox:适用机型",
        groupId: 'picker',
        data: [['GT-81', 1]],
        validate: {
            required: true,
        },
        validateMessage: {
            required: '至少选择一款机型'
        },
        tips: '设置该应用限制的定制机机型'
    },
    ], submitTitle: "保存",
    cancel: function () {
        window.location.href = './app-limit/index';
    },
    submit: function () {
        if (appSelectVals.length == 0) {
            $('#error-tip-one').remove();
            $('.field-input-box:first').append(errorTipOne);
        }
        if (schoolId.length == 0) {
            $('#error-tip-two').remove();
            $('.field-input-box:eq(1)').append(errorTipTwo)
        }
        if (!submited) {
            var appId = [];
            var appStr = "";
            if (appInfo.length == appSelectVals.length) {
                appStr = "ALL";
            } else {
                appSelectVals.forEach(function (val, i) {
                    appId.push(appSelectVals[i].id)
                })
                appStr = appId.join(',');
            }
            //目前只有gt-81;
            deviceType = "GT-81";
            if (appSelectVals.length > 0 && schoolId.length > 0) {
                submited = true;
                new G.Request(__config.apiServer + '/applimit/addLimtPolicy').$do({
                    appId: appStr,
                    schoolId: schoolId.join(','),
                    deviceType: deviceType,
                    funId: funId.join(','),
                    permission: permission.join(',')
                }, "post").$success(function (data) {
                    submited = false;
                    window.location.href = './app-limit/index';
                }).$beforeRequest(function () {
                    return;
                })
            }
        }
    }
});
function setSearchTree(data) {
    for (var k = 0; k < data.length; k++) {
        schoolVal.forEach(function (val, i) {
            if (data[k].orgId == schoolVal[i].orgId) {
                data[k].checked = true;
            }
        })
    }
    var tree = new G.Tree({
        data: data,
        idKey: 'orgId',
        pIdKey: 'orgPid',
        nameKey: 'orgName',
        callback: {
            onCheck: function (data, x, y) {
                if (y.checked) {
                    schoolVal.push(y);
                } else {
                    schoolVal.forEach(function (val, i) {
                        if (y.orgId == schoolVal[i].orgId) {
                            schoolVal.splice(i, 1);
                        }
                    });
                }
            }
        },
        check: {
            cls: '', //节点check的样式，right or 空串
            chkboxType: { "Y": "ps", "N": "ps" },//"p" 表示操作会影响父级节点 "s" 表示操作会影响子级节点
            enable: true
        },
        view: {
            nameIsHTML: true,
        },
    })
    return tree.$html;
}
function setTree(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].nocheck = true;
        if (data[i].childNodes)
            for (var j = 0; j < data[i].childNodes.length; j++) {
                data[i].childNodes[j].nocheck = true;
                if (data[i].childNodes[j].childNodes)
                    for (var k = 0; k < data[i].childNodes[j].childNodes.length; k++) {
                        data[i].childNodes[j].childNodes[k].isParent = true;
                        data[i].childNodes[j].childNodes[k].nocheck = true;
                    }
            }
    }
    var tree = new G.Tree({
        data: data,
        idKey: 'areaCode',
        pIdKey: 'areaPcode',
        nameKey: 'areaName',
        simpleData: false,
        children: "childNodes",
        autoFirstNodeClick: true,
        callback: {
            onCheck: function (data, x, y) {
                if (y.checked) {
                    schoolVal.push(y);
                } else {
                    schoolVal.forEach(function (val, i) {
                        if (y.orgId == schoolVal[i].orgId) {
                            schoolVal.splice(i, 1);
                        }
                    });
                }
            }
        },
        check: {
            cls: '', //节点check的样式，right or 空串
            chkboxType: { "Y": "ps", "N": "ps" },//"p" 表示操作会影响父级节点 "s" 表示操作会影响子级节点
            enable: true
        },
        view: {
            nameIsHTML: true,
        },
        async: {
            enable: true,
            url: __config.apiServer + '/orgManage/getUnderOrg',
            type: 'get',
            autoParam: ["areaCode"],
            otherParam: { type: "SCHOOL", form: true },
            dataType: 'text',
            dataFilter: function (treeId, parentNode, responseData) {
                if (responseData) {
                    if (responseData.message.content) {
                        responseData = responseData.message.content;
                        responseData.forEach(function (val, i) {
                            responseData[i].areaName = responseData[i].orgName;
                            schoolVal.forEach(function (val, j) {
                                if (responseData[i].orgId == schoolVal[j].orgId) {
                                    responseData[i].checked = true;
                                }
                            })
                        })
                        return responseData;
                    } else {
                        G.tips("该地区下无数据", "error");
                    }
                }
            },
            contentType: 'application/x-www-form-urlencoded'
        },
    });
    return tree.$html;
}
$('#container').append(form.$html);
$("input[name='selectApp']").css('display', 'inline-block');
$("input[name='selectApp']").after('<span id="select-all-span"><input style="margin-left:20px" type="checkbox" name="selectAllApp" value="全选应用">全部应用</span>');
$('.form-actions').before('<div class="setlimit-div">' +
    '<span style="display:inline-table">应用允许访问的权限</span> ' +
    '<a id="setLimit" herf="">设置访问的权限</a><div id="limitName"></div></div>');
$('.form-actions').before('<div class="setlimit-div" >' +
    '<span style="display:inline-table">应用限制使用的功能</span> ' +
    '<a id="setFunction" herf="">设置功能限制</a><div id="functionName"></div></div>');
var errorTipOne = '<p id="error-tip-one" style="color:red">至少选择一款应用</p>'
var errorTipTwo = '<p id="error-tip-two" style="color:red">至少选择一个对象</p>'
var spanShow = $('<div class="field-input app-name-input"><div id="app-name-content"></div></div>')
var spanShowTow = $('<div class="field-input app-name-input-two"><div id="app-name-content-two"></div></div>')
var selectShow = '<div  class="app-name-div"><span class="app-name-span">{{=it.appName}}<a class="glyphicon glyphicon-remove glyphicon-one"></a><span><div>'
var selectShowTwo = '<div  class="app-name-div-two"><span class="app-name-span">{{=it.appName}}<a  class="glyphicon glyphicon-remove glyphicon-two"></a><span><div>'
$(document).ready(function () {
    $("input[name='selectAllApp']").click();
    $("input[name='deviceType[]']").click();
    $("input[name='selectApp']").remove();
    $('.field-input-box:first').prepend(spanShow);
    $('#app-name-content').append('<p>-请选择-</p>');
    $("input[name='selectProject']").remove();
    $('.field-input-box:eq(1)').prepend(spanShowTow);
    $('#app-name-content-two').append('<p>-请选择-</p>');
    new G.Request(__config.apiServer + '/applimit/getPermission').$do({}, "get").$success(function (data) {
        limitVals = data;
        limitVals.forEach(function (val, i) {
            //将用户选中的权限保存显示在页面上
            permission.push(limitVals[i].authCode);
            $(G.template('<div class="limit-name">{{=it.name}}</div>', { name: limitVals[i].authName })).appendTo('#limitName');
        })
    })
});
var tipText = '';
var okBtn = $('<div style="padding:20px"><button id="okClick" class="btn ok-btn btn-primary">确定</button></div>');
var search = '<div class="search-div" style="padding:10px 20px"><input id="search"type="text" placeholder={{=it.name}}><span class="glyphicon glyphicon-search"></span></div>';
$(document).on('click', '.glyphicon-one', function () {
    delSpan = true;
    var index = $('.glyphicon-one').index(this)
    $('.app-name-div').eq(index).remove();
    appSelectVals.splice(index, 1);
    $("input[name='selectAllApp']").prop('checked', false);
    limitListOpen = true;
    if (appSelectVals.length > 1 || appSelectVals.length == 0) {
        $('.app-package-p').remove();
        $('#app-package-p').remove();
        $('.setlimit-div:last').hide();
        appFunctions = [];
    } else if (appSelectVals.length == 1) {
        $('.setlimit-div:last').show();
        $("#select-all-span").after('<p id="app-package-p"><b>' + appSelectVals[0].packageName + '</b></p>');
        $('.field-label:first').append('<p class="app-package-p">应用包名 :</p>');
        getFuctionInfo();
    }
    if (appSelectVals.length == 0) {
        $('#app-name-content').append('<p>-请选择-</p>');
        $('.field-input-box:first').append(errorTipOne);
    }
    setTimeout(function () {
        delSpan = false;
    }, 300);
})
$(document).on('click', '.glyphicon-two', function () {
    delSpan = true;
    var index = $('.glyphicon-two').index(this)
    $('.app-name-div-two').eq(index).remove();
    schoolVal.splice(index, 1);
    schoolId.splice(index, 1);
    if (schoolId.length == 0) {
        $('#app-name-content-two').append('<p>-请选择-</p>');
        $('.field-input-box:eq(1)').append(errorTipTwo)
    }
    setTimeout(function () {
        delSpan = false;
    }, 300);
})
$(document).on('click', "#app-name-content", function () {
    if (!delSpan && limitListOpen) {
        searchVal = [];
        var sidebarSetLimit = new G.ui.SidebarDialog({
            title: "选择应用",
            content: limitList
        });
        new G.Request(__config.apiServer + '/applimit/getAppListWithSearchKey').$do({}, "get").$success(function (data) {
            appInfo = data.content;
            //渲染limitList侧滑栏
            limitList.empty();
            tipText = '输入应用名称/包名搜索';
            limitList.append($(G.template(search, { name: tipText })));
            appInfo.forEach(function (val, i) {
                limitList.append('<div class="app-select-div"><span><input id="switchCP' + [i] + '"type="checkbox">' + appInfo[i].appName + '</span>' +
                    '<span>' + appInfo[i].packageName + '</span></div>');
                limitList.find('#switchCP' + i).click(function () {
                    appInfo[i].checked = limitList.find($('#switchCP' + i)).is(':checked');
                })
            })
            limitList.append(okBtn);
            //设置checkbox状态;
            if (appSelectVals.length > 0) {
                //如果appSelectVals有数据则显示上一次已保存的数据
                limitList.find($('input:checkbox')).each(function (i) {
                    appSelectVals.forEach(function (val, j) {
                        if (appSelectVals[j].id == appInfo[i].id) {
                            appInfo[i].checked = true;
                            limitList.find('#switchCP' + i).prop('checked', true);
                        }
                    })
                });
            }
        })
        //添加动态绑定事件
        limitList.on('click', '.glyphicon-search', function () {
            // searchVal = searchName(appInfo, limitList.find('#search').val());
            new G.Request(__config.apiServer + '/applimit/getAppListWithSearchKey').$do({ searchKey: limitList.find('#search').val() }, "get").$success(function (data) {
                searchVal = data.content;
                limitList.empty();
                limitList.append($(G.template(search, { name: tipText })));
                searchVal.forEach(function (val, i) {
                    limitList.append('<div class="app-select-div"><span><input id="switchCP' + [i] + '"type="checkbox">' + searchVal[i].appName + '</span>' +
                        '<span>' + searchVal[i].packageName + '</span></div>');
                    appInfo.forEach(function (val, j) {
                        if (searchVal[i].id == appInfo[j].id) {
                            limitList.find('#switchCP' + i).prop('checked', appInfo[j].checked);
                        }
                    })
                })
                limitList.append(okBtn);
                searchVal.forEach(function (val, i) {
                    limitList.find('#switchCP' + i).click(function () {
                        searchVal[i].checked = limitList.find($('#switchCP' + i)).is(':checked');
                    })
                })
            });
        });
        //设置点击确定按钮;
        limitList.on('click', '#okClick', function () {
            appSelectVals = [];
            appInfo.forEach(function (val, i) {
                searchVal.forEach(function (val, j) {
                    if (searchVal[j].id == appInfo[i].id) {
                        appInfo[i].checked = searchVal[j].checked;
                    }
                })
                if (appInfo[i].checked) {
                    appSelectVals.push(appInfo[i]);
                }
            });
            $('.app-package-p').remove();
            $('#app-package-p').remove();
            //如果选择的app大于1则隐藏app功能限制的按钮,后端只能给一个app做功能限制
            if ((1 < appSelectVals.length && appSelectVals.length < appInfo.length) || appSelectVals.length == 0) {
                $('.setlimit-div:last').hide();
                appFunctions = [];
            } else if (appInfo.length == appSelectVals.length) {
                $("input[name='selectAllApp']").click();
            } else if (appSelectVals.length == 1) {
                $("#select-all-span").after('<p id="app-package-p"><b>' + appSelectVals[0].packageName + '</b></p>');
                $('.field-label:first').append('<p class="app-package-p">应用包名 :</p>');
                $('.setlimit-div:last').show();
                getFuctionInfo();
            }
            sidebarSetLimit.remove();
            if (appInfo.length > appSelectVals.length) {
                //将选择的app名字加入到文本框
                if (appSelectVals.length == 0) {
                    $('#error-tip-one').remove();

                    $('#app-name-content').append('<p>-请选择-</p>');
                    $('.field-input-box:first').append(errorTipOne)
                } else {
                    $('#error-tip-one').remove();
                }
                $('#app-name-content').empty();
                appSelectVals.forEach(function (val, i) {
                    $('#app-name-content').append(G.template(selectShow, { appName: appSelectVals[i].appName }));
                })
            }
        });
    }
});
$("input[name='selectAllApp']").click(function () {
    $('#app-name-content').empty();
    $('#app-name-content').append('<p>-请选择-</p>');
    if ($("input[name='selectAllApp']").is(':checked')) {
        limitListOpen = false;
        new G.Request(__config.apiServer + '/applimit/getAppListWithSearchKey').$do({}, "get").$success(function (data) {
            appInfo = data.content;
            appSelectVals = appInfo;
            appId = [];
            $(".app-name-input").css("background-color", "gainsboro");
            // $('#app-name-content').empty();
            // appSelectVals.forEach(function (val, i) {
            //     $('#app-name-content').append(G.template(selectShow, { appName: appSelectVals[i].appName }));
            // })
            //如果选择的app大于1则隐藏app功能限制的按钮,后端只能给一个app做功能限制
            if (appSelectVals.length > 1 || appSelectVals.length == 0) {
                // $('.app-package-p').remove();
                // $('#app-package-p').remove();
                $('.setlimit-div:last').hide();
                appFunctions = [];
                $('#functionName').empty();
            } else if (appSelectVals.length == 1) {

                $('.setlimit-div:last').show();
                $('#functionName').empty();
                // $("#select-all-span").after('<p id="app-package-p"><b>' + appSelectVals[0].packageName + '</b></p>');
                // $('.field-label:first').append('<p class="app-package-p">应用包名 :</p>');
                // getFuctionInfo();
            }
        })
    } else {
        limitListOpen = true;
        $("input[name='selectApp']").attr("disabled", false);
        appSelectVals = [];
        $("input[name='selectApp']").val("");
        $('.setlimit-div:last').show();
        $(".app-name-input").css("background-color", "white");
    }
});

$(document).on('click', "#app-name-content-two", function () {
    if (!delSpan) {
        searchVal = [];
        limitList.empty();
        tipText = '输入学校名称搜索';
        limitList.append($(G.template(search, { name: tipText })));
        var sidebarSetLimit = new G.ui.SidebarDialog({
            title: "适用对象",
            content: limitList
        });
        //只做一次请求,将返回值给schoolVal
        new G.Request(__config.apiServer + '/orgManage/getAreaTree').$setMethod('GET').$do().$success(function (data) {
            limitList.append(setTree(data));
            limitList.append(okBtn);
        });
        limitList.on('click', '.glyphicon-search', function () {

            if (limitList.find('#search').val() == null || limitList.find('#search').val().trim() == "") {
                new G.Request(__config.apiServer + '/orgManage/getAreaTree').$setMethod('GET').$do().$success(function (data) {

                    limitList.empty();
                    tipText = '输入学校名称搜索';
                    limitList.append($(G.template(search, { name: tipText })));
                    limitList.append(setTree(data));
                    limitList.append(okBtn);

                });
            } else {
                new G.Request(__config.apiServer + '/orgManage/getUnderOrg').$do({ type: "SCHOOL", searchKey: limitList.find('#search').val() }, 'get').$success(function (data) {
                    limitList.empty();
                    tipText = '输入学校名称搜索';
                    limitList.append($(G.template(search, { name: tipText })));
                    searchVal = data.content;
                    limitList.append(setSearchTree(searchVal));
                    limitList.append(okBtn);
                })
            }
        });
        limitList.on('click', '#okClick', function () {
            sidebarSetLimit.remove();
            schoolId = [];
            $('#app-name-content-two').empty();
            schoolVal.forEach(function (val, i) {
                schoolId.push(schoolVal[i].schoolId);
                $('#app-name-content-two').append(G.template(selectShowTwo, { appName: schoolVal[i].orgName }));
            })
            if (schoolId.length == 0) {
                            $('#error-tip-two').remove();

                $('#app-name-content-two').append('<p>-请选择-</p>');
                $('.field-input-box:eq(1)').append(errorTipTwo)
            } else {
                $("#error-tip-two").remove();
            }
        });
    }
})
//弹出应用权限列表设置菜单
$("#setLimit").click(function () {
    //设置一个标签,否则每次快速点击都会访问服务器,造成多次探出侧滑栏
    var open = false;
    if (open) {
        return;
    }
    limitList.empty();
    if (!open) {
        open = true;
        new G.Request(__config.apiServer + '/applimit/getPermission').$do({}, "get").$success(function (data) {
            for (var i = 0; i < data.length; i++) {
                limitList.append('  <li class="list-item">' +
                    '<p class="select-p">' + data[i].authName + '<br>' + data[i].authDesc + '</p>' +
                    '<div class="select-div">' +
                    '<div class="weui-cell__ft" >' +
                    '<label for="switchCP' + i + '" class="weui-switch-cp" >' +
                    '<input id="switchCP' + i + '" class="weui-switch-cp__input" type= "checkbox">' +
                    '<div class="weui-switch-cp__box" > </div>' +
                    '</label>' +
                    '</div>' +
                    '</div>' +
                    '</li>');
            };
            limitList.append(okBtn);
            var sidebarSetLimit = new G.ui.SidebarDialog({
                title: "设置应用访问权限",
                content: limitList
            });
            if (limitVals.length > 0) {
                //如果limitVals有数据则显示上一次已保存的数据
                limitList.find($('input:checkbox')).each(function (i) {
                    limitVals.forEach(function (val, j) {
                        if (limitVals[j].id == data[i].id)
                            limitList.find('#switchCP' + i).prop('checked', true);
                    })
                });
            } else {
                //如果limitVals没数据将列表数据赋给他
                limitList.find($('input:checkbox')).each(function (i) {
                    limitVals = [];
                    if (limitList.find('#switchCP' + i).is(':checked'))
                        limitVals.push(data[i]);
                });
            }
            //绑定点击事件
            limitList.find('#okClick').click(function () {
                limitVals = []; //将checkVal清空重新赋值
                limitList.find($('input:checkbox')).each(function (i) {
                    if (limitList.find('#switchCP' + i).is(':checked'))
                        limitVals.push(data[i]);
                });
                sidebarSetLimit.remove();
                permission = [];
                $('#limitName').empty();
                limitVals.forEach(function (val, i) {
                    //将用户选中的权限保存显示在页面上
                    permission.push(limitVals[i].authCode);
                    $(G.template('<div class="limit-name">{{=it.name}}</div>', { name: limitVals[i].authName })).appendTo('#limitName');
                })
            })
        })
    }
})
function getFuctionInfo() {
    funId = [];
    new G.Request(__config.apiServer + '/applimit/getLimitFunction').$do({ appId: appSelectVals[0].id }, "get").$success(function (data) {
        data.forEach(function (val, i) {
            if (data[i].funName == " ") {
                data[i].funName = '&nbsp'
            } else if (data[i].funName == null) {
                data[i].funName = '未命名'
            }
            if (data[i].status) {
                data[i].status = false;
            }
            appFunctions = data;
        })
    })
}
//弹出应用功能设置菜单
$("#setFunction").click(function () {
    limitList.empty();
    for (var i = 0; i < appFunctions.length; i++) {
        limitList.append('<li class="list-item">' +
            '<div><input id="rename' + [i] + '" class="rename" type=text ><span id="renames' + [i] + '" class="glyphicon glyphicon-ok"></span>' +
            '<div class="limit"><span id="limit' + [i] + '">' + appFunctions[i].funName + '</span><span id="limits' + [i] + '" class="glyphicon glyphicon-edit"></span></div>' +
            '<p class="select-p">' + appFunctions[i].className + '</p></div>' +
            '<div class="select-div">' +
            '<div class="weui-cell__ft" >' +
            '<label for="switchCP' + i + '" class="weui-switch-cp" >' +
            '<input id="switchCP' + i + '" class="weui-switch-cp__input" type= "checkbox">' +
            '<div class="weui-switch-cp__box" > </div>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</li>');
        limitList.find('#rename' + [i]).hide();
        limitList.find('#renames' + [i]).hide();
        limitList.find('#limits' + [i]).hide();
        limitList.find('.limit').on("mouseover mouseout", function (event) {
            var index = limitList.find('.limit').index(this);
            if (event.type == "mouseover") {
                limitList.find('#limits' + [index]).show();
            } else if (event.type == "mouseout") {
                limitList.find('#limits' + [index]).hide();
            }
        })
        limitList.find('#limits' + [i]).on('click', function () {
            var index = limitList.find('.glyphicon-edit').index(this);
            limitList.find('#rename' + [index]).show().focus();
            limitList.find('#rename' + [index]).blur(function () {
                //防止失去焦点和点击事件冲突的问题
                setTimeout(function () {
                    limitList.find('#rename' + [index]).hide();
                    limitList.find('#renames' + [index]).hide();
                    limitList.find('#limit' + [index]).show();
                }, 300);
            });
            limitList.find('#renames' + [index]).show();
            limitList.find('#limit' + [index]).hide();
            limitList.find('#limits' + [index]).hide();
        });
        limitList.find('#renames' + [i]).on('click', function () {
            var index = limitList.find('.glyphicon-ok').index(this);
            var renameVal = limitList.find('#rename' + [index]).val();
            if (renameVal.trim() == "") {
                renameVal = "未命名"
            }
            new G.Request(__config.apiServer + '/applimit/updateAppLimitName')
                .$do({ 'funId': appFunctions[index].funId, 'appLimitName': renameVal }, "post").$success(function (data) {
                    getFuctionInfo();
                    limitList.find('#rename' + [index]).hide();
                    limitList.find('#renames' + [index]).hide();
                    limitList.find('#limit' + [index]).show();
                    // limitList.find('#limits' + [index]).show();
                    limitList.find('#limit' + [index]).html(renameVal);
                });
        });
    }
    limitList.append(okBtn);
    var sidebarSetLimit = new G.ui.SidebarDialog({
        title: "设置应用限制功能",
        content: limitList
    });
    if (appFunctions.length > 0) {
        //如果appFunctions有数据则显示上一次已保存的数据
        limitList.find($('input:checkbox')).each(function (i) {
            limitList.find('#switchCP' + i).prop('checked', appFunctions[i].status);
        });
    }
    limitList.find('#okClick').click(function () {
        sidebarSetLimit.remove();
        limitList.find($('input:checkbox')).each(function (i) {
            appFunctions[i].status = limitList.find('#switchCP' + i).is(':checked');
        });
        $('#functionName').empty();
        funId = [];
        appFunctions.forEach(function (val, i) {
            if (appFunctions[i].status == true) {
                //将用户选中的权限保存显示在页面上
                funId.push(appFunctions[i].funId);
                $(G.template('<div class="limit-name">{{=it.name}}</div>', { name: appFunctions[i].funName })).appendTo('#functionName');
            }
        });
    });
})