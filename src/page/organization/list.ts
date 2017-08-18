let _this = {};
let isFirst = true;
let areaData = [];
areaData.areaCode = "110000";
areaData.type = "MANAGE";
areaData.from = true;
//当前机构信息
_this.orgInfo = {};

//模板
_this.tpl = require("raw!./list.html");
_this.$html = $(_this.tpl);

//树形
_this.tree = new G.Tree({
    model: new G.Request(__config.apiServer + '/orgManage/getAreaTree').$setMethod('GET'),
    idKey: 'areaCode',
    pIdKey: 'areaPcode',
    nameKey: 'areaName',
    simpleData: false,
    children: "childNodes",
    autoFirstNodeClick: true,
    callback: {
        onClick: Click,
    },
    view: {
        showIcon: false,
    },
    search: {
        model: new G.Request(__config.apiServer + '/orgManage/getAreaTree').$parse(function (data) {
            this.data = { content: data.slice(0, 10), total: Math.min(data.length, 10) };
        }).$setMethod('GET'),
        onClick: function (data, e) {
            var node = _this.tree.ztreeObj.getNodeByParam('areaCode', data['areaCode']);
            //选中节点
            _this.tree.ztreeObj.selectNode(node);
            Click(e, false, node)
        },
        placeholder: "请输入省市区县名称查找"
    }
});

function Click(event, treeId, treeNode) {
    areaData.areaCode = treeNode.areaCode || '';
    //省市区code
    areaData.totalCode = treeNode.getPath() || '';
    _this.areaCode = treeNode.areaCode || '';
    _this.initData(areaData);
}
//
var _tplListItem = require('raw!./list_item.html');

//机构列表
_this.table = new G.Table({
    showSelect: false,
    autoInit: false,
    model: new G.Request(__config.apiServer + '/orgManage/getUnderOrg'),
    columns: [
        {
            field: ":",
            td_class: "td-inline-block",
            render: function (val, td) {
                return G.template(_tplListItem, td);
            }
        }
    ],
    paging: {
        pageSize: 9,
        selector: [6, 9]
    },
});

//添加学校新增按钮
_this.table.on('afterRender', function () {
    if ($('.list-type-tab span.active').data('value') == "SCHOOL") {
        _this.table.$html.find("tbody").append('<tr class="add-school"><td><div>+</div></td></tr>');
    }
});
//添加开通学校
_this.$html.on("click", ".add-school", function () {
    var data = new Object();
    if (areaData.totalCode != undefined) {
        for (var i = 0; i < areaData.totalCode.length; i++) {
            if (i == 0) {
                data.provinceCode = areaData.totalCode[0].areaCode;
            } else if (i == 1) {
                data.cityCode = areaData.totalCode[1].areaCode;
            } else if (i == 2) {
                data.areaCode = areaData.totalCode[2].areaCode;
            }
        }
    } else {
        data.provinceCode = 11;
    }
    var addForm = new G.Form({
        class: 'schoolmage-form',
        title: "新增学校",
        data: data,
        fields: [
            {
                field: 'schoolName:text:学校名称',
                placeholder: '学校名称',
                validate: {
                    required: true,
                    maxlength: 16,
                    minlength: 2
                }
            },
            {
                field: 'schoolCode:text:学校编码',
                placeholder: '如:XMSM615,设定后不可修改',
                validate: {
                    required: true,
                    maxlength: 16,
                    minlength: 4,
                    alnum: true,
                },
            },
            {
                field: "provinceCode:select:省份",
                data: (new G.Request(__config.zhixikeServer + '/gnw-system-web/city/getProvinceList')).$parseSelectArray('areaCode', 'areaName'),
                next: 'cityCode',
                validate: {
                    required: true,
                }
            },
            {
                field: "cityCode:select:城市",
                data: (new G.Request(__config.zhixikeServer + '/gnw-system-web/city/getCityListByProvinceCode')).$parseSelectArray('areaCode', 'areaName'),
                prev: 'provinceCode',
                next: 'areaCode',
                validate: {
                    required: true
                }
            },
            {
                field: "areaCode:select:区县",
                data: (new G.Request(__config.zhixikeServer + '/gnw-system-web/city/getDistrictListByCityCode')).$parseSelectArray('areaCode', 'areaName'),
                prev: 'cityCode',
                validate: {
                    required: true
                }
            },
            {
                field: 'address:text:详细地址',
                validate: {
                    required: true
                }
            },
            {
                field: 'schoolType:select:学校类型',
                data: (new G.Request(__config.zhixikeServer + '/gnw-system-web/school/getTypeList').$setParams({ queryType: 1 })).$parseSelectArray('dictCode', 'dictName'),
            },
            {
                field: 'businessScope:checkbox:开通业务',
                data: [['学习', '1'], ['管控', '2']],
                value: ['1', '2'],
                validate: {
                    required: true
                }
            },
            {
                field: 'stageCodes:checkbox:学段',
                data: [['小学', '1'], ['初中', '2'], ['高中', '3']],
                value: ['1', '2', '3'],
                validate: {
                    required: true
                }
            }, {
                field: 'identifier:text:管理员账号',
                validate: {
                    required: true,
                    orgAccount: true
                }
            },
            {
                field: 'credential:password:密码',
                options: {
                    showEye: true
                },
                validate: {
                    required: true,
                    _password: true,
                    maxlength: 16,
                    minlength: 6
                }
            },
            {
                field: 'status:radio:状态',
                data: [['启用', 'N'], ['禁用', 'F']],
                value: ['N'],
                validate: {
                    required: true
                }
            },

        ],
        submit: function () {
            var data = addForm.getData();
            var schLen = [
                addForm.$html.find('.schLen1 select').val(),
                addForm.$html.find('.schLen2 select').val(),
                addForm.$html.find('.schLen3 select').val()
            ];
            data['schLen'] = schLen.join(',');
            data.orgId = areaData.orgPid;
            new G.Request(__config.apiServer + '/schoolManage/addSchool').$do(data).$success(function (res) {
                G.tips('添加成功');
                sidebar.remove();
                _this.initData(areaData);
            }).$error(function (data) {
                G.tips(data.error, 'warning');
                return false;
            });
        },
        cancel: false,
        submitTitle: '确定'
    });
    //学段下学制设置
    var schLenHtml = require('raw!./school_add_stage.html');
    addForm.$html.find('input[name="stageCodes[]"]').parentsUntil('.field', '.field-input-box').append(schLenHtml);
    addForm.$html.on('change', 'input[name="stageCodes[]"]', function () {
        var index = $(this).val();
        if ($(this).prop('checked')) {
            addForm.$html.find('.schLen' + index).show();
        } else {
            addForm.$html.find('.schLen' + index).hide();
        }
    })
    var sidebar = new G.ui.SidebarDialog({
        title: "开通学校",
        content: addForm.$html
    });
});

//机构学校切换
_this.$html.on("click", ".list-type-tab span", function () {
    $(this).addClass('active').siblings().removeClass('active');
    let data = [];
    data.areaCode = areaData.areaCode;
    data.from = areaData.from;
    data.type = $(".list-type-tab span.active").data("value");
    data.orgPid = areaData.orgPid;
    _this.table.model.$setParams(data);
    _this.table.render(1);
});

//开通弹窗
_this.$html.on("click", ".btnDredge", function () {
    let data = [];
    data.orgId = $('.btnDredge').data('orgid');
    data.doKey = "N";
    new G.Request(__config.apiServer + '/orgManage/orgOorC').$do(data).$success(function () {
        var form = new G.Form({
            "className": "dredge-dialog",
            fields: [{
                field: "schoolId:checkbox:",
                data: new G.Request(__config.apiServer + '/orgManage/getNoOwnerOrgOrSch').$setMethod('GET').$setParams(areaData).$parseSelectArray('id', 'schoolName'),
            }],
            submitTo: new G.Request(__config.apiServer + '/orgManage/saveOrg').$setParams({ "id": data.orgId, "orgPid": data.orgId }).$success(function () {
                G.tips('开通成功');
                dialog.close();
                _this.initData(areaData);
            }),
            cancel: false,
            submitTitle: "确定"
        });
        let dialog = new G.dialog({
            title: "开通成功",
            className: "dredge-dialog",
            content: form.$html
        });
        form.$html.find(".field-label").append("<div>已成功开通“<span></span>”，请选择相应的学校成为该机构的下属学校</div>");
        form.$html.find(".field-label span").append($('.btnDredge').data('orgname'));
        form.$html.find(".form-actions").before("<hr>")

    }).$error(function (data) {
        G.tips(data.message, 'warning');
        return false;
    });
});

//关闭机构
_this.$html.on("click", ".btnClose", function () {
    let data = [];
    data.orgId = $('.btnClose').data('orgid');
    data.doKey = "F";
    new G.Request(__config.apiServer + '/orgManage/orgOorC').$do(data).$success(function () {
        _this.initData(areaData);
    })
});

//管理员配置
_this.$html.on("click", ".btnAdmin", () => {
    let dataAdmin = [];
    dataAdmin.orgName = $('.btnAdmin').data('orgname');
    dataAdmin.orgId = $('.btnAdmin').data('orgid');
    dataAdmin.areaCode = $('.btnAdmin').data('areacode');
    new G.Request(__config.apiServer + '/orgManage/getOrgAdmin').$setMethod('GET').$do({ "orgId": $('.btnAdmin').data('orgid') }).$success(function (data) {
        let form = new G.Form({
            data: data || {},
            fields: [
                {
                    field: "orgName:text:机构名称",
                    value: $('.btnAdmin').data('orgname'),
                    readonly: true,
                },
                {
                    field: "identifier:text:管理员账户",
                    readonly: data == null ? false : true,
                    validate: {
                        required: true,
                        orgAccount: true
                    },
                },
                {
                    field: "credential:password:密码",
                    validate: {
                        _password: true,
                        maxlength: 16,
                        minlength: 4
                    },
                    placeholder: "编辑时留空不修改密码",
                    options: {
                        showEye: true,
                    }
                },
                {
                    field: "relName:text:姓名",
                    validate: {

                    },
                },
                {
                    field: "phoneNo:text:联系电话",
                    validate: {
                        mobile: true,
                    },
                },
                {
                    field: "status:radio:状态",
                    groupId: 'picker',
                    data: [['启用', 'N'], ['禁用', 'F']],
                    validate: {
                        required: true,
                    },
                }
            ],
            submitTo: new G.Request(__config.apiServer + '/orgManage/addAdmin').$setParams(dataAdmin).$success(function (data) {
                G.tips('保存成功');
                sidebarAddClass.remove();
                _this.initData(areaData);
            }).$error(function (data) {
                G.tips(data.message, 'warning');
                return false;
            }),
            showCancel: false,
            submitTitle: "保存",
            class: "manage-admin",
        });
        let sidebarAddClass = new G.ui.SidebarDialog({
            title: "管理员管理",
            content: form.$html,
        });
    })
})

//权限配置
_this.$html.on("click", ".btnPermission", function () {
    var _permissionListTpl = require('raw!./list_permission_list_tpl.html');
    new G.Request(__config.apiServer + '/orgManage/getOrgPri').$setMethod('GET').$do({ "orgId": $('.btnPermission').data('orgid') }).$success((data) => {
        var sidebarAddClass = new G.ui.SidebarDialog({
            title: "配置权限",
            content: G.template(_permissionListTpl, { "data": data }),
        });
        //默认选中的checkbox
        $(".plalst input:checkbox").each(function () {
            if ($(this).attr("status") == "1") {
                $(this).prop("checked", "checked");
            } else {
                $(this).prop("checked", false);
            }

        })
        //全选或不全选
        sidebarAddClass.$html.on("change", '.select-all :input', function () {
            $(".plalst input:checkbox").each(function () {
                if ($('.select-all :input').prop("checked")) {
                    $(this).prop("checked", "checked");
                } else {
                    $(this).prop("checked", false);

                }

            })
        });
        //点击label让checkbox勾选或取消勾选
        sidebarAddClass.$html.on('click', 'label', function () {
        });
        //保存
        sidebarAddClass.$html.on('click', '.btn-submit', function () {
            let data = [];
            let formData = sidebarAddClass.$html.find('form').serializeObject();
            if (formData.学校管理 && formData.机构菜单) {
                data.priIds = formData.学校管理 + ',' + formData.机构菜单;
            } else if (formData.学校管理) {
                data.priIds = formData.学校管理;
            } else if (formData.机构菜单) {
                data.priIds = formData.机构菜单;
            }

            data.orgId = $(".btnPermission").data("orgid");
            new G.Request(__config.apiServer + '/orgManage/setControlConfigForOrg').$do(data).$success(function () {
                sidebarAddClass.remove();
            })
        });
    });
})


//个性配置
_this.$html.on("click", ".btnCharacter", function () {
    let form = new G.Form({
        data: _this.orgInfo,
        fields: [
            {
                field: 'id:hidden:'
            },
            {
                field: "orgUrl:text:",
                groupId: 'text',
                validate: {
                    maxlength: 10,
                    urlSuffix: true,
                },
            },
            {
                field: "templateId:select:个性化模板",
                groupId: 'select',
                data: new G.Request(__config.apiServer + '/school/getListBySpecNew').$setParams({ 'type': 'MANAGE' }).$parseSelectArray('id', 'tplName'),
                placeholder: false,
            },
        ],
        submitTo: new G.Request(__config.apiServer + '/orgManage/saveOrg').$success(function () {
            G.tips('保存成功');
            sidebarAddClass.remove();
            _this.initData(areaData);
        }).$error(function (data) {
            G.tips(data.message, 'warning');
            return false;
        }),
        showCancel: false,
        submitTitle: "保存",
        class: "select-character"
    });
    var sidebarAddClass = new G.ui.SidebarDialog({
        title: "配置",
        content: form.$html,
    });
    let url = __config.zhixikeOrgServer.replace(/^https?:\/\//, '');
    form.$html.find(".text").before("<div class='title-url'>个性化域名后缀</div>");
    form.$html.find('.text .field-label').append('<span class="org-url">' + url + '/org/</span>')
})

//编辑机构
_this.$html.on("click", ".btnEdit", function () {
    let orgData = [];
    orgData.id = $('.btnEdit').data('orgid');
    orgData.areaCode = $('.btnEdit').data('areacode');
    new G.Request(__config.apiServer + '/orgManage/getOrgArea').$setMethod('GET').$do(orgData).$success(function (data) {
        let form = new G.Form({
            data: data.ORG,
            fields: [
                {
                    field: "orgName:text:机构名称",
                    validate: {
                        required: true,
                        maxlength: 50,
                        orgNameSuffix: true,
                        remote: {
                            url: new G.Request(__config.apiServer + '/orgManage/checkOrgNameExist').$getUrl(),
                            type: "get",
                            async: false,
                            xhrFields: {
                                withCredentials: true,
                            },
                            data: {
                                orgId: data.ORG.id,
                                orgPid: $('.btnEdit').data('orgpid'),
                            }
                        }
                    },
                    validateMessage: {
                        remote: "机构名已存在"
                    },
                    tips: '限50个字符。支持汉字、字母、数字、空格、_、?、!',
                    groupId: 'text',
                },
                {
                    field: "orgPid:select:上级机构",
                    data: (new G.Request(__config.apiServer + '/orgManage/getSuperOrg')).$setMethod('GET').$setParams({ "areaCode": areaData.areaCode }).$parseSelectArray('id', 'orgName'),
                    groupId: 'select',
                    placeholder: false,
                },
            ],
            showCancel: false,
            submitTitle: "保存",
            class: "edit-org",
            submitTo: new G.Request(__config.apiServer + '/orgManage/saveOrg').$setParams(orgData).$success(function () {
                G.tips('保存成功');
                sidebarAddClass.remove();
                _this.initData(areaData);

            }),
        });
        var sidebarAddClass = new G.ui.SidebarDialog({
            title: "编辑机构",
            content: form.$html,
        });
    });
})


//点击机构列表
_this.$html.on("click", ".org-list-item", function (data) {
    if ($('.list-type-tab span.active').data('value') == "MANAGE") {
        areaData.areaCode = $(this).data('areacode');
        areaData.orgPid = $(this).data('orgpid');
        _this.initData(areaData);
        var node = _this.tree.ztreeObj.getNodeByParam("areaCode", areaData.areaCode, null);
        _this.tree.ztreeObj.selectNode(node);
    }
})

/**
 * 获取机构数据
 */
_this.initData = function (areaCode) {
    new G.Request(__config.apiServer + '/orgManage/getOrgArea').$setMethod('GET').$do(areaCode).$success(function (data) {
        var _tplListTitle = require('raw!./list_title.html');
        _this.$html.find(".list-title").empty().append($(G.template(_tplListTitle, data)));
        //机构信息
        _this.orgInfo = data['ORG'];
        areaData.orgPid = data.ORG.id;
    });
    setTimeout(() => {
        _this.table.model.$setParams(areaData);
        _this.table.render(1);
    }, 200)

};

if (isFirst) {
    _this.initData(areaData);
    isFirst = false;
}

$.validator.addMethod("urlSuffix", (value) => {
    let el = /^([a-z]|[A-Z]|[0-9]|[-]){1,10}$/;
    return !value || el.test(value);
}, $.validator.format("仅允许输入横线、数字或者字母"));

$.validator.addMethod("orgNameSuffix", (value) => {
    let el = /^([\u4E00-\u9FFF]|[a-z]|[A-Z]|[0-9]|[_]|[?？]|[!！]|[\s]){1,50}$/;
    return !value || el.test(value);
}, $.validator.format("仅允许输入汉字、字母、数字、空格、_、?、!"));
//账号
$.validator.addMethod("orgAccount", function (value) {
    var el = /^([a-z]|[A-Z]|[0-9]){6,16}$/;
    return !value || el.test(value);
}, $.validator.format("账号长度为6位-16位，必须包含数字和字母"));

_this.$html.find(".list-table").append(_this.table.$html);
_this.$html.find(".tree").append(_this.tree.$html);

$('#container').append(_this.$html);