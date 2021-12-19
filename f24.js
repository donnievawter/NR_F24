const choices = ["MSG", "SEL", "ID", "AIR", "STA", "CLK"];
const counts = {
    "MSG": 0,
    "SEL": 0,
    "ID": 0,
    "AIR": 0,
    "STA": 0,
    "CLK": 0
}
let st = [];
const status = {}

let newPayload = "";
let accum = global.get("counts") || counts;
msg.data = [];
const onlyUnique = (value, index, self) => self.indexOf(value) === index;
let b = msg.payload.split("\n");
for (const element of b) {
    let a = element.split(",");
    if (a[0] === 'ID') {
        let oldSign = a[4];
        let newSign = a[10];
        let ac = global.get("aircraft");
        let i = ac.indexOf(oldSign);
        newPayload = a[4] + '<>' + a[10];
        if (i >= 0) {
            let cs = global.get("callsigns") || {};
            cs[oldSign] = newSign;
            global.set("callsigns", cs);
            newPayload = "CHANGED" + newPayload;
        }
    }
    if (a[0] === "AIR") {
        let aircraft = global.get("aircraft") || [];
        aircraft.push(a[4]);
        let ac = aircraft.filter(onlyUnique);
        global.set("aircraft", ac);
        newPayload = "AIR >" + a[4] + "< " + a.length + " " + a;
        let total = global.get("totalaircraft", "file") || 0;
        let grandtotal = global.get("grandtotalaircraft", "file") || 0;
        total++;
        grandtotal++;
        global.set("totalaircraft", total, "file");
        global.set("grandtotalaircraft", grandtotal, "file");
    }
    if ((a[0] === "STA")) {
        let aircraft = global.get("aircraft") || [];
        newPayload = a[4];
        let i = aircraft.indexOf(a[4]);
        if (i >= 0) {
            let removed = global.get("removed") || [];
            removed.push(a[4]);
            global.set("removed", removed);
            aircraft.splice(i, 1);
            global.set("aircraft", aircraft);
            newPayload = a[0] + a[4] + " removed " + aircraft.length + " remaining";
        } else {
            newPayload = a[0] + ">" + a[4] + "< not found with STA of >" + a[10] + "<" + a;
        }
        let callsigns = global.get("callsigns") || {};
        delete callsigns[a[4]];
        global.set("callsigns", callsigns);
    }
    if ((a[0] === "MSG") && (a[1] == 3)) {
        let lat = parseFloat(a[14]);
        let lon = parseFloat(a[15]);
        if ((lon < (-99)) && (lon > (-110)) && (lat > 33) && (lat < 43)) {
            let callsigns = global.get("callsigns") || {};
            let distance = global.get("getDistance", "file")(lat, lon);
            let maxDistance = global.get("maxDistance") || 0;
            let minDistance = global.get("minDistance") || 200;
            let northlat = global.get("northlat") || 0;
            let southlat = global.get("southlat") || 44;
            let eastlon = global.get("eastlon") || -111;
            let westlon = global.get("westlon") || -99;
            if (lat > northlat) {
                global.set("northlat", lat);
                global.set("northlon", lon);
                global.set("northdistance", distance);
                if (callsigns[a[4]]) {
                    global.set("northid", callsigns[a[4]]);
                } else {
                    global.set("northid", a[4]);
                }
            }
            if (lat < southlat) {
                global.set("southlat", lat);
                global.set("southlon", lon);
                global.set("southdistance", distance);
                if (callsigns[a[4]]) {
                    global.set("southid", callsigns[a[4]]);
                } else {
                    global.set("southid", a[4]);
                }
            }
            if (lon > eastlon) {
                global.set("eastlat", lat);
                global.set("eastlon", lon);
                global.set("eastdistance", distance);
                if (callsigns[a[4]]) {
                    global.set("eastid", callsigns[a[4]]);
                } else {
                    global.set("eastid", a[4]);
                }
            }
            if (lon < westlon) {
                global.set("westlat", lat);
                global.set("westlon", lon);
                global.set("westdistance", distance);
                if (callsigns[a[4]]) {
                    global.set("westid", callsigns[a[4]]);
                } else {
                    global.set("westid", a[4]);
                }
            }
            if (distance > maxDistance) {
                global.set("maxDistance", distance);
                global.set("latitude", a[14]);
                global.set("longitude", a[15]);
                let cs = global.get("callsigns") || {};
                if (cs[a[4]]) {
                    global.set("maxid", cs[a[4]]);
                } else {
                    global.set("maxid", a[4]);
                }
            }
            if (distance < minDistance) {
                global.set("minDistance", distance);
                global.set("minlatitude", lat);
                global.set("minlongitude", lon);
                let cs = global.get("callsigns") || {};
                if (cs[a[4]]) {
                    global.set("minid", cs[a[4]]);
                } else {
                    global.set("minid", a[4]);
                }
            }
            let latsfound = global.get("latsfound") || 0;
            global.set("latsfound", ++latsfound);
        } else {
            newPayload = a[14] + " " + a[15] + " out of range";
        }
    }
    if ((a[0] === "MSG") && (a[1] == 5)) {
        let altitude = parseInt(a[11]);
        msg.typeof = typeof (altitude);
        if (altitude < 0) {
            altitude = 0;
        }
        let maxAltitude = global.get("maxAltitude") || 0;
        let minAltitude = global.get("minAltitude") || 40000;
        if (altitude > maxAltitude) {
            global.set("maxAltitude", altitude);
            let cs = global.get("callsigns") || {};
            if (cs[a[4]]) {
                global.set("maxaltid", cs[a[4]]);
            } else {
                global.set("maxaltid", a[4]);
            }
        }
        if (altitude < minAltitude) {
            global.set("minAltitude", altitude);
            let cs = global.get("callsigns") || {};
            if (cs[a[4]]) {
                global.set("minaltid", cs[a[4]]);
            } else {
                global.set("minaltid", a[4]);
            }
        }


    }
}
msg.payload = newPayload;

return msg;
