const { default: axios } = require("axios");
var fs = require('fs')
const Transform = require("stream").Transform


const replace = async (file, key, value) => {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(new RegExp("{{{" + key + "}}}", "g"), value);

        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}
const fetchCms = (session,url) => {
    const headers = {
        "Content-Type": 'application/json',
        "x-project": 'bGlicmFyeTpyM3VqMWI2Ym84ZGsxNTBhazkxYjVmYWtrazZyZjY='
    };
    axios.post(url, config = {
        headers
    })
        .then(result => {
            if (result) {
                const buckets = []
                let payload
                const list = result.list ? result.list : [];
                if (list.length > 0) {
                    list.forEach(value => {
                        if (value['page'] in buckets) {
                            buckets[value['page']].push([
                                {
                                    'key': value['content_key'],
                                    'type': value['content_type'],
                                    'value': value['content_value'],
                                }]);
                        }
                        else {
                            buckets[value['page']] = []
                            buckets[value['page']].push(
                                {
                                    'key': value['content_key'],
                                    'type': value['content_type'],
                                    'value': value['content_value'],
                                }
                            );
                        }
                    })
                }
                session.cms = buckets
                payload = buckets
            } else {
                payload = session.cms;
            }
            return payload;
        })
}

module.exports = { replace, fetchCms }