import React, { Component } from "react";
import { ElectrodeGeometryView } from "../ElectrodeGeometryView/ElectrodeGeometryViewPlugin";

const MountainClient = require('@mountainclient-js').MountainClient;

class RecordingSummaryView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            locations: null,
            labels: null,
            params: null
        };
    }

    async componentDidMount() {
        await this.loadGeom();
        await this.loadParams();
    }

    async componentDidUpdate(prevProps) {
        if ((prevProps.geomPath !== this.props.geomPath)) {
            await this.loadGeom();
        }
        if ((prevProps.paramsPath !== this.props.paramsPath)) {
            await this.loadParams();
        }
    }

    async loadGeom() {
        this.setState({ locations: null, labels: null });
        let geomTxt = await this.props.kacheryManager.loadText(this.props.geomPath);
        let locations = load_geom_csv(geomTxt);
        if (!locations) return { locations: null, labels: null };
        let labels = [];
        for (let i in locations) {
            labels.push(Number(i) + 1);
        }
        this.setState({ locations, labels })
    }

    async loadParams() {
        this.setState({ params: null });

        let params = await(this.props.kacheryManager.loadObject(this.props.paramsPath));
        this.setState({ params: params });
    }

    render() {
        if (!this.state.locations) {
            return <div></div>;
        }
        return <div>
            <table className="table">
                <tbody>
                    <tr><td>Sampling freq (Hz)</td><td>{this.state.params ? this.state.params.samplerate : '...'}</td></tr>
                    <tr><td>Num. channels</td><td>{this.state.locations ? this.state.locations.length : '...'}</td></tr>
                </tbody>
            </table>
            <ElectrodeGeometryView
                path={this.props.geomPath}
                kacheryManager={this.props.kacheryManager}
            />
        </div>;
    }
}

export default class RecordingSummaryViewPlugin {
    static getViewComponentsForFile(path, opts) {
        return [];
    }
    static getViewComponentsForDir(dir, opts) {
        if (('geom.csv' in dir.files) && ('params.json' in dir.files)) {
            return [{
                component: <RecordingSummaryView
                    geomPath={`sha1://${dir.files['geom.csv'].sha1}/geom.csv`}
                    paramsPath={`sha1://${dir.files['params.json'].sha1}/params.json`}
                    kacheryManager={opts.kacheryManager}
                />,
                size: 'large'
            }];
        }
        return [];
    }
};

function load_geom_csv(txt) {
    let locations = [];
    var list = txt.split('\n');
    for (var i in list) {
        if (list[i].trim()) {
            var vals = list[i].trim().split(',');
            for (var j in vals) {
                vals[j] = Number(vals[j]);
            }
            while (vals.length < 2) vals.push(0);
            locations.push(vals);
        }
    }
    return locations
}

// async function loadText(path, opts) {
//     let response;
//     try {
//         response = await axios.get(`/api/loadText?path=${encodeURIComponent(path)}`);
//     }
//     catch (err) {
//         console.error(err);
//         return null;
//     }
//     let rr = response.data;
//     if (rr.success) {
//         return rr.text;
//     }
//     else return null;
// }

// async function loadObject(path, opts) {
//     opts = opts || {};
//     if (!path) {
//         if ((opts.key) && (opts.collection)) {
//             path = `key://pairio/${opts.collection}/~${hash_of_key(opts.key)}`;
//         }
//     }
//     let response;
//     try {
//         response = await axios.get(`/api/loadObject?path=${encodeURIComponent(path)}`);
//     }
//     catch (err) {
//         console.error(err);
//         console.error(`Problem loading object: ${path}`);
//         return null;
//     }
//     let rr = response.data;
//     if (rr.success) {
//         return rr.object;
//     }
//     else return null;
// }
