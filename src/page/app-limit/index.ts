var table = new G.Table({
    model: (new G.Request(__config.apiServer + "/applimit/getPageList").$success()),
    showSelect: false,
    search: {
        fields: [
            {
                field: 'appName:text:应用搜索',
                placeholder: '输入应用名称',
            },
        ]
    },
    columns: [
        {
            field: ':序号:50px',
            render: function () {
                return table.dData.length + 1;
            }
        },
        {
            field: 'appNames:应用名称:200px',
        },
        {
            field: 'authNames:允许权限',
            render: function (data) {
                if (data == null) {
                    return "---"
                }
                return data;
            }
        },
        {
            field: 'funNames:限制功能:',
            render: function (data) {
                if (data == null) {
                    return "---"
                }
                return data;
            }
        },
        {
            field: 'deviceModels:设备型号:'
        },
        {
            field: 'objectNames:适用对象:'
        },
        {
            field: 'endTime:策略时间段:100px'
        },
    ],
    paging:
    {
        pageSize: 20,
    }
});
$('#container').append(table.$html);
$('<p class="top-count-p">*当前功能仅对新T1有效，后续新增定制机机型*</p>'
    + '<button id="setLimitBtn" style="margin-left:8%" class="btn btn-primary">+应用限制策略</button>').appendTo('.table-search-bar');
$('#setLimitBtn').click(function setLimit() {
    window.location.href = './app-limit/set_limit';
});