/* eslint-disable eol-last */
/* eslint-disable indent */
// 项目开发阶段需要用到的babel插件
const prodPlugins = ['transform-remove-console']
if (process.env.NODE_ENV === 'production') {
    prodPlugins.push()
}
module.exports = {
    presets: ['@vue/cli-plugin-babel/preset'],
    plugins: [
        [
            'component',
            {
                libraryName: 'element-ui',
                styleLibraryName: 'theme-chalk'
            }
        ],
        // 发布产品时的插件数组
        ...prodPlugins,
        '@babel/plugin-syntax-dynamic-import'
    ]
}