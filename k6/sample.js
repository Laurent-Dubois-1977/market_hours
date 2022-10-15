import http from 'k6/http';
import { sleep } from 'k6';


export let options = {
    vus: 3,
    duration: '10s',
  };

export default function () {
    var params = {
        'headers': {
        'apikey': 'AAC6C3962AF4CA981739C4C22EA36F8A5C4FD7489B4E8AD55F78A1EE4C'
    }
}
http.get('http://localhost:4200/api/v1/task/', params);
sleep(1);
}