const cheerio = createCheerio()

const UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'

const SITE = 'https://mmsi01.com'

let appConfig = {
    ver: 1,
    title: 'mmsi01',
    site: SITE,
}

/* ================= 入口 ================= */

async function getConfig() {
    const config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

/* ================= 分类 ================= */

async function getTabs() {
    // 如果站点有明确分类接口，替换这里
    // 没有的话给一个“最新”
    return [
        {
            name: '最新',
            ui: 1,
            ext: {
                typeurl: `${SITE}/`,
            },
        },
    ]
}

/* ================= 列表 ================= */

async function getCards(ext) {
    ext = argsify(ext)
    const { page = 1, typeurl } = ext
    const cards = []

    // 这里按首页 / 列表页结构解析
    const url = page === 1 ? typeurl : `${typeurl}?page=${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    // ⚠️ 下面选择器按常见结构写，如不匹配，改选择器即可
    $('a[href^="/e/"]').each((_, el) => {
        const href = $(el).attr('href')
        const title =
            $(el).attr('title') ||
            $(el).find('img').attr('alt') ||
            $(el).text().trim()

        const cover =
            $(el).find('img').attr('data-src') ||
            $(el).find('img').attr('src')

        if (!href) return

        cards.push({
            vod_id: href,
            vod_name: title || '未命名',
            vod_pic: cover,
            ext: {
                url: SITE + href,
            },
        })
    })

    return jsonify({ list: cards })
}

/* ================= 播放列表 ================= */

async function getTracks(ext) {
    ext = argsify(ext)
    const url = ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
            Referer: SITE + '/',
        },
    })

    const $ = cheerio.load(data)

    // 直接在 HTML / script 中抓 m3u8
    // 覆盖你给的这种：/stream/.../index-v1-a1.m3u8
    const m3u8 =
        data.match(/https?:\/\/[^'"]+\/index[^'"]+\.m3u8/)?.[0]

    if (!m3u8) {
        throw new Error('未找到 m3u8')
    }

    return jsonify({
        list: [
            {
                title: '默认线路',
                tracks: [
                    {
                        name: '播放',
                        ext: {
                            url: m3u8,
                            referer: url, // 播放页作为 Referer（最稳）
                        },
                    },
                ],
            },
        ],
    })
}

/* ================= 播放 ================= */

async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url
    const referer = ext.referer || SITE + '/'

    return jsonify({
        urls: [url],
        headers: [
            {
                Referer: referer,
                'User-Agent': UA,
            },
        ],
    })
}

/* ================= 搜索（如站点支持） ================= */

async function search(ext) {
    ext = argsify(ext)
    const { text, page = 1 } = ext
    const cards = []

    // 若站点没有搜索，可直接返回空
    const url = `${SITE}/search?q=${encodeURIComponent(text)}&page=${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    $('a[href^="/e/"]').each((_, el) => {
        const href = $(el).attr('href')
        const title =
            $(el).attr('title') ||
            $(el).find('img').attr('alt') ||
            $(el).text().trim()

        const cover =
            $(el).find('img').attr('data-src') ||
            $(el).find('img').attr('src')

        if (!href) return

        cards.push({
            vod_id: href,
            vod_name: title || '未命名',
            vod_pic: cover,
            ext: {
                url: SITE + href,
            },
        })
    })

    return jsonify({ list: cards })
}

/* ================= 工具 ================= */

function argsify(ext) {
    if (!ext) return {}
    if (typeof ext === 'string') {
        try {
            return JSON.parse(ext)
        } catch (e) {
            return {}
        }
    }
    return ext
}

function jsonify(obj) {
    return JSON.stringify(obj)
}
