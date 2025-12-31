async function getConfig() {
    const config = {
        site: "https://xiaoyakankan.com",
        name: "小鸭看看",
        tabs: [
            { name: "电影", ext: { type: "10" } },
            { name: "连续剧", ext: { type: "11" } },
            { name: "综艺", ext: { type: "12" } },
            { name: "动漫", ext: { type: "13" } },
            { name: "福利", ext: { type: "15" } }
        ]
    };
    return jsonify(config);
}
async function getCards(extStr) {
    const ext = argsify(extStr);
    const type = ext.type || "10";
    const page = parseInt(ext.page) || 1;

    let url = `https://xiaoyakankan.com/cat/${type}.html`;
    if (page > 1) {
        url = `https://xiaoyakankan.com/cat/${type}-${page}.html`;
    }

    const { data } = await $fetch.get(url);
    const $ = cheerio.load(data);

    const cards = [];
    $('.m4-list .item').each((_, el) => {
        const $item = $(el);
        const $link = $item.find('.link');
        const vodId = $link.attr('href'); // e.g. "/post/xxx.html"
        const title = $item.find('.title').text().trim();
        const img = $link.find('img').attr('data-src');
        const remarks = $link.find('.tag1').text().trim();
        const tag2 = $link.find('.tag2').text().trim(); // "动作片 / 2025年"

        let vodYear = "";
        let vodType = "";
        if (tag2) {
            const parts = tag2.split(" / ");
            vodType = parts[0] || "";
            const yearMatch = parts[1]?.match(/(\d{4})/);
            vodYear = yearMatch ? yearMatch[1] : "";
        }

        if (vodId && title) {
            cards.push({
                vod_id: vodId,
                vod_name: title,
                vod_pic: img?.startsWith('http') ? img : 'https:' + img,
                vod_remarks: remarks,
                vod_year: vodYear,
                vod_type: vodType,
                ext: {
                    detailUrl: 'https://xiaoyakankan.com' + vodId
                }
            });
        }
    });

    return jsonify({ list: cards, total: cards.length });
}

async function getPlayinfo(extStr) {
    const ext = argsify(extStr);
    const url = ext.url; // 即 detailUrl

    // 不解析，直接跳转
    return jsonify({
        parse: 0,
        url: url,
        header: {}
    });
}