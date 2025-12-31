// 模拟 XPTV 内置方法，本地调试用（开发完成后无需删除，XPTV 会优先使用内置方法）
const axios = require('axios'); // 替代 XPTV 的 $fetch
const cheerio = require('cheerio'); // 解析 HTML
const CryptoJS = require('crypto-js'); // 加密解密
const fs = require('fs'); // 本地缓存模拟（可选）

// 模拟 XPTV 内置工具函数
const $utils = {
    toastInfo: (msg) => console.log(`[提示] ${msg}`),
    toastError: (msg) => console.error(`[错误] ${msg}`),
    os: () => 'tvOS/18.1', // 模拟系统版本
    app: () => '2.0' // 模拟 XPTV 版本
};

// 模拟 XPTV 网络请求（$fetch）
const $fetch = {
    get: async (url, options = {}) => {
        try {
            const response = await axios.get(url, { headers: options.headers });
            return { data: response.data };
        } catch (err) {
            $utils.toastError(`GET 请求失败：${url}`);
            console.error(err);
            return { data: '' };
        }
    },
    post: async (url, data, options = {}) => {
        try {
            const response = await axios.post(url, data, { headers: options.headers });
            return { data: response.data };
        } catch (err) {
            $utils.toastError(`POST 请求失败：${url}`);
            console.error(err);
            return { data: '' };
        }
    }
};

// 模拟 XPTV 缓存方法
const $cache = {
    get: (key) => {
        // 本地调试用文件缓存，实际 XPTV 用内置缓存
        try {
            const data = fs.readFileSync(`./cache/${key}.txt`, 'utf8');
            return data;
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            fs.mkdirSync('./cache', { recursive: true });
            fs.writeFileSync(`./cache/${key}.txt`, value, 'utf8');
        } catch (e) {
            $utils.toastError(`缓存设置失败：${key}`);
        }
    },
    del: (key) => {
        try {
            fs.unlinkSync(`./cache/${key}.txt`);
        } catch (e) {
            $utils.toastError(`缓存删除失败：${key}`);
        }
    }
};

// 模拟 XPTV 序列化/反序列化方法
function jsonify(s) { return JSON.stringify(s); } // 对象转字符串
function argsify(s) { // 字符串转对象（兼容 XPTV 入参出参要求）
    if (!s) return {};
    if (typeof s === 'string') {
        try {
            return JSON.parse(s);
        } catch (e) {
            $utils.toastError(`解析失败：${s}`);
            return {};
        }
    }
    return s;
}

// 模拟 XPTV 配置（根据实际站点修改）
const appConfig = {
    site: 'https://xiaoyakankan.com/' // 小鸭看看
};

// 日志打印（模拟 XPTV 的 $print）
function $print(msg) {
    console.log(`[日志] ${msg}`);
}
// 1. 获取基础配置（站点名称、导航标签等）
async function getConfig() {
    const config = {
        name: '小鸭看看', // 小鸭看看
        type: 3, // 固定为 3
        tabs: [ // 导航标签（对应 HTML 中的 6 个分类）
            {
                name: '首页',
                ext: jsonify({ tabType: 'home', url: `${appConfig.site}/` }) // 首页地址
            },
            {
                name: '电影',
                ext: jsonify({ tabType: 'movie', url: `${appConfig.site}/cat/10.html` }) // 电影分类地址
            },
            {
                name: '连续剧',
                ext: jsonify({ tabType: 'drama', url: `${appConfig.site}/cat/11.html` }) // 连续剧分类地址
            },
            {
                name: '综艺',
                ext: jsonify({ tabType: 'variety', url: `${appConfig.site}/cat/12.html` }) // 综艺分类地址
            },
            {
                name: '动漫',
                ext: jsonify({ tabType: 'anime', url: `${appConfig.site}/cat/13.html` }) // 动漫分类地址
            },
            {
                name: '福利',
                ext: jsonify({ tabType: 'welfare', url: `${appConfig.site}/cat/15.html` }) // 福利分类地址
            }
        ]
    };
    return jsonify(config); // 出参必须是字符串
}
// 1. 获取基础配置（站点名称、导航标签等）
async function getConfig() {
    const config = {
        name: '你的站点名称', // 比如「XXX影视」（显示在 XPTV 中）
        type: 3, // 固定为 3
        tabs: [ // 导航标签（对应 HTML 中的 6 个分类）
            {
                name: '首页',
                ext: jsonify({ tabType: 'home', url: `${appConfig.site}/` }) // 首页地址
            },
            {
                name: '电影',
                ext: jsonify({ tabType: 'movie', url: `${appConfig.site}/cat/10.html` }) // 电影分类地址
            },
            {
                name: '连续剧',
                ext: jsonify({ tabType: 'drama', url: `${appConfig.site}/cat/11.html` }) // 连续剧分类地址
            },
            {
                name: '综艺',
                ext: jsonify({ tabType: 'variety', url: `${appConfig.site}/cat/12.html` }) // 综艺分类地址
            },
            {
                name: '动漫',
                ext: jsonify({ tabType: 'anime', url: `${appConfig.site}/cat/13.html` }) // 动漫分类地址
            },
            {
                name: '福利',
                ext: jsonify({ tabType: 'welfare', url: `${appConfig.site}/cat/15.html` }) // 福利分类地址
            }
        ]
    };
    return jsonify(config); // 出参必须是字符串
}
// 3. 获取播放集（剧集列表，比如某部剧的 1-20 集）
async function getTracks(ext) {
    const params = argsify(ext); // 解析入参（getCards 传递的 ext）
    const tracks = []; // 存储播放集数据

    try {
        const { url } = params; // 视频详情页地址
        const { data } = await $fetch.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        // 示例：解析剧集列表（需根据站点 HTML 结构修改选择器）
        $('.episode-item').each((index, el) => {
            const episodeTitle = $(el).text().trim(); // 集数名称（比如「第 1 集」）
            const episodeUrl = $(el).attr('href'); // 单集播放页链接

            tracks.push({
                track_id: episodeUrl || `episode_${index}`, // 集数唯一标识（字符串）
                track_name: episodeTitle, // 集数名称
                ext: jsonify({ url: `${appConfig.site}${episodeUrl}` }) // 传递给 getPlayinfo 的参数
            });
        });
    } catch (err) {
        $utils.toastError('获取播放集失败');
        console.error(err);
    }

    return jsonify(tracks); // 出参必须是字符串
}

// 4. 获取播放源链接（核心！解析视频真实播放地址）
async function getPlayinfo(ext) {
    const params = argsify(ext); // 解析入参（getTracks 传递的 ext）
    const playUrls = [];

    try {
        const { url } = params; // 单集播放页地址
        const { data } = await $fetch.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        // 示例 1：直接解析 HTML 中的播放地址（简单站点）
        const videoUrl = $('video source').attr('src');
        if (videoUrl) {
            playUrls.push({
                name: '默认线路',
                url: videoUrl, // 真实视频播放地址
                headers: {} // 无需额外请求头则留空
            });
        }

        // 示例 2：如果播放地址是加密的（AES 解密，需根据站点加密规则修改）
        // const encryptedUrl = $('script').text().match(/encryptUrl="(.*?)"/)[1];
        // const key = '站点的加密密钥'; // 需抓包分析获取
        // const decryptedUrl = CryptoJS.AES.decrypt(encryptedUrl, key).toString(CryptoJS.enc.Utf8);
        // playUrls.push({ name: '加密线路', url: decryptedUrl, headers: {} });

    } catch (err) {
        $utils.toastError('获取播放地址失败');
        console.error(err);
    }

    return jsonify({ urls: playUrls, headers: [] }); // 出参必须是字符串
}

// 5. 搜索功能（根据关键词搜索视频）
async function search(ext) {
    const params = argsify(ext);
    const { keyword } = params; // 搜索关键词
    const cards = [];

    try {
        // 示例：搜索接口（需替换为目标站点的搜索地址）
        const searchUrl = `${appConfig.site}/search?keyword=${encodeURIComponent(keyword)}`;
        const { data } = await $fetch.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        // 解析搜索结果（和 getCards 解析逻辑类似，修改选择器即可）
        $('.search-item').each((_, el) => {
            const title = $(el).find('.title').text().trim();
            const cover = $(el).find('img').attr('src');
            const href = $(el).find('a').attr('href');
            const remarks = $(el).find('.tag').text().trim();

            cards.push({
                vod_id: href || title,
                vod_name: title,
                vod_pic: cover,
                vod_remarks: remarks,
                ext: jsonify({ url: `${appConfig.site}${href}` })
            });
        });
    } catch (err) {
        $utils.toastError('搜索失败');
        console.error(err);
    }

    return jsonify({ list: cards }); // 出参必须是字符串
}

// 本地调试代码（运行插件整个流程）
async function testPlugin() {
    console.log('=== 开始测试插件 ===');
    // 1. 获取配置
    const configStr = await getConfig();
    const config = argsify(configStr);
    console.log('配置：', config);

    // 2. 获取首页卡片
    const cardsStr = await getCards(config.tabs[0].ext);
    const cards = argsify(cardsStr);
    console.log('首页卡片：', cards.list);

    // 3. 获取第一个视频的播放集
    if (cards.list.length > 0) {
        const tracksStr = await getTracks(cards.list[0].ext);
        const tracks = argsify(tracksStr);
        console.log('播放集：', tracks);

        // 4. 获取第一个播放集的播放地址
        if (tracks.length > 0) {
            const playinfoStr = await getPlayinfo(tracks[0].ext);
            const playinfo = argsify(playinfoStr);
            console.log('播放地址：', playinfo.urls);
        }
    }

    // 5. 测试搜索
    const searchStr = await search(jsonify({ keyword: '测试关键词' }));
    const searchResult = argsify(searchStr);
    console.log('搜索结果：', searchResult.list);
}

// 执行测试（本地调试时运行）
testPlugin();