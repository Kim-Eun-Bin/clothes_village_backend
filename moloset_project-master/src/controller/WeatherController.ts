// OpenWeatherMap API Key
let apiKey = '55c1870a054d53480d84f9a2fcd71f81';

export class WeatherController {

    // 현재 날씨
    static currentWeather = async (req, res) => {
        // Post로 넘어오는 parameter 받기(위도, 경도)
        const {lat, lon} = req.body;
        var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&lang=kr&exclude=minutely,hourly&appid=" + apiKey;
        var request = require('request');

        // 현재날짜의 온도, 아이콘 구하기
        // var result = request('GET', url);
        // console.log(result.getBody);

        request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            var resultBody = JSON.parse(response.body);

            // API에서 리턴되는 날짜의 형식이 UNIX의 날짜형식이기 때문에 다음과 같은 작업을 해줘야한다.
            var temp = Math.round(resultBody.current.temp - 273.15);
            var icon = 'http://openweathermap.org/img/wn/' + resultBody.current.weather[0].icon + '.png';
            var maxTemp = Math.round(resultBody.daily[0].temp.max - 273.15);
            var minTemp = Math.round(resultBody.daily[0].temp.min - 273.15);

            res.json({"temp":temp,"maxTemp":maxTemp,"minTemp":minTemp,"icon":icon});
        });
    }

    // 시간별 날씨
    static hourlyWeather = async (req, res) => {
        // Post로 넘어오는 parameter 받기(위도, 경도)
        const {lat, lon} = req.body;
        var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&lang=kr&exclude=current,minutely,daily&appid=" + apiKey;
        var request = require('request');
        var resultList = new Array();

        request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            var resultBody = JSON.parse(response.body);

            for (var i = 0; i < 48; i++){
                // API에서 리턴되는 날짜의 형식이 UNIX의 날짜형식이기 때문에 다음과 같은 작업을 해줘야한다.
                var unix_timestamp = resultBody.hourly[i].dt;
                var date = new Date(unix_timestamp * 1000);
                var dateYMD = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
                var dateHour = date.getHours();

                // 시스템 날짜 가져오기
                var today = new Date();
                var todayYMD = today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
                
                // 3시간 단위 출력을 위한 분기
                if (dateHour != 0 && dateHour%3 != 0){
                    continue;
                }        

                var time = dateHour + '시';
                var icon = 'http://openweathermap.org/img/wn/' + resultBody.hourly[i].weather[0].icon + '.png';
                var temp = Math.round(resultBody.hourly[i].temp - 273.15);

                resultList.push({"time":time, "icon":icon, "temp":temp});
            }
            res.json(resultList);
        });
    }

    // 일자별 날씨
    static dailyWeather = async (req, res) => {
        // Post로 넘어오는 parameter 받기(위도, 경도)
        const {lat, lon} = req.body;
        var url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&lang=kr&exclude=current,minutely,hourly&appid=" + apiKey;
        var request = require('request');
        var resultList = new Array();

        request({
            url: url,
            method: 'GET'
        }, function (error, response, body) {
            var resultBody = JSON.parse(response.body);

            for (var i = 0; i < 7; i++){
                // API에서 리턴되는 날짜의 형식이 UNIX의 날짜형식이기 때문에 다음과 같은 작업을 해줘야한다.
                var unix_timestamp = resultBody.daily[i].dt;
                var date = new Date(unix_timestamp * 1000);
                var day = null;

                // 요일
                switch(date.getDay()){
                    case 0: day = '일'; break;
                    case 1: day = '월'; break;
                    case 2: day = '화'; break;
                    case 3: day = '수'; break;
                    case 4: day = '목'; break;
                    case 5: day = '금'; break;
                    case 6: day = '토'; break;
                }

                var maxTemp = Math.round(resultBody.daily[i].temp.max - 273.15);                                    // 최고온도
                var minTemp = Math.round(resultBody.daily[i].temp.min - 273.15);                                    // 최저온도
                var icon = 'http://openweathermap.org/img/wn/' + resultBody.daily[i].weather[0].icon + '.png';      // 날씨 이미지
                resultList.push({"day":day, "maxTemp":maxTemp, "minTemp":minTemp, "icon":icon});                    // 결과값 저장
            }
            res.json(resultList);
        });
    }
}