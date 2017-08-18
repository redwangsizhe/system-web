/**
 * Created by max on 2017/6/29.
 */
var table = new G.Table({
    model: (new G.Request(__config.apiServer + '/demo/getPageList')),
    search: {
        fields: [
            {
                field: 'key:text:标题',
                placeholder: '输入要搜索的关键字'
            }
        ]
    },
    columns: [
        {
            field: 'title:标题:'
        },
        {
            field: 'content:内容:'
        },
        {
            field: ':操作:',
            render: function () {
                var html = '<span class="btnEdit btn btn-outline btn-primary btn-xs">编辑</span>';
                html += '<span class="btnDel btn btn-outline btn-danger btn-xs">删除</span>';
                return html;
            }
        }
    ]
});

$('#container').append(table.$html);