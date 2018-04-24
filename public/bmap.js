import {
  uiModules
} from 'ui/modules';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

import BmapTemplate from 'plugins/bmap/bmapTemplate.html';
import EditorTemplate from 'plugins/bmap/editor.html';

/* import 'echarts/lib/chart/map';
import 'echarts/map/js/china'; */
const echarts = require('echarts');
require('echarts/dist/extension/bmap');
import { MP } from './map.js';
// Create an Angular module for this plugin
const module = uiModules.get('kibana/bmap', ['kibana']);

module.controller('BmapController', function ($scope, $injector, $window, $http, $document, $rootScope, $element, es, Private) {

  // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init($element[0]);
  let option = null;
  $scope.$watch('esResponse', function (resp) {
    //console.log($scope.vis.aggs);
    if (!resp) {
      $scope.results = null;
      return;
    }

    if(!$scope.vis.aggs.bySchemaName.longitude || !$scope.vis.aggs.bySchemaName.latitude || !$scope.vis.aggs.bySchemaName.docvalue) {
      return;
    }
    const longitude = $scope.vis.aggs.bySchemaName.longitude[0].id;

    const latitude = $scope.vis.aggs.bySchemaName.latitude[0].id;

    const docvalue = $scope.vis.aggs.bySchemaName.docvalue[0].id;
    const name = $scope.vis.aggs.bySchemaName.docvalue[0].__schema.name;

    const symbolcolor = $scope.vis.aggs.bySchemaName.symbolcolor[0].id;
    //const dtype = $scope.vis.aggs.bySchemaName.dtype[0].id;



    // Get the buckets of that aggregation
    const buckets = resp.aggregations[longitude].buckets;
    const searchData = [];
    const fileds = $scope.vis.params.field;
    const filedArray = fileds.split(',');
    const colors = $scope.vis.params.color;
    const colorArray = colors.split(',');

    const map = new Map();
    for(let i = 0; i < filedArray.length; i++) {
      map.set(filedArray[i], colorArray[i]);
    }
    buckets.forEach(element => {
      const symbolcolorv = element[latitude].buckets[0][docvalue].buckets[0][symbolcolor].buckets[0].key;
      if(map.get(symbolcolorv)) {
        searchData.push({
          name: name,
          value: [element.key, element[latitude].buckets[0].key, element[latitude].buckets[0][docvalue].buckets[0].key],
          itemStyle: {
            color: map.get(symbolcolorv)
          }
        });
      }else{
        searchData.push({
          name: name,
          value: [element.key, element[latitude].buckets[0].key, element[latitude].buckets[0][docvalue].buckets[0].key]
        });
      }

    });



    option = {
      title: {
        text: $scope.vis.params.bmapText,
        subtext: $scope.vis.params.bmapSubText,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          let res = params.name + '<br/>';
          res += (params.data.value[2] + '</br>');
          return res;
        }
      },
      bmap: {
        center: [104.114129, 37.550339],
        zoom: 5,
        roam: true,
        mapStyle: {
          styleJson: [{
            'featureType': 'water',
            'elementType': 'all',
            'stylers': {
              'color': '#d1d1d1'
            }
          }, {
            'featureType': 'land',
            'elementType': 'all',
            'stylers': {
              'color': '#f3f3f3'
            }
          }, {
            'featureType': 'railway',
            'elementType': 'all',
            'stylers': {
              'visibility': 'off'
            }
          }, {
            'featureType': 'highway',
            'elementType': 'all',
            'stylers': {
              'color': '#fdfdfd'
            }
          }, {
            'featureType': 'highway',
            'elementType': 'labels',
            'stylers': {
              'visibility': 'off'
            }
          }, {
            'featureType': 'arterial',
            'elementType': 'geometry',
            'stylers': {
              'color': '#fefefe'
            }
          }, {
            'featureType': 'arterial',
            'elementType': 'geometry.fill',
            'stylers': {
              'color': '#fefefe'
            }
          }, {
            'featureType': 'poi',
            'elementType': 'all',
            'stylers': {
              'visibility': 'off'
            }
          }, {
            'featureType': 'green',
            'elementType': 'all',
            'stylers': {
              'visibility': 'off'
            }
          }, {
            'featureType': 'subway',
            'elementType': 'all',
            'stylers': {
              'visibility': 'off'
            }
          }, {
            'featureType': 'manmade',
            'elementType': 'all',
            'stylers': {
              'color': '#d1d1d1'
            }
          }, {
            'featureType': 'local',
            'elementType': 'all',
            'stylers': {
              'color': '#d1d1d1'
            }
          }, {
            'featureType': 'arterial',
            'elementType': 'labels',
            'stylers': {
              'visibility': 'off'
            }
          }, {
            'featureType': 'boundary',
            'elementType': 'all',
            'stylers': {
              'color': '#fefefe'
            }
          }, {
            'featureType': 'building',
            'elementType': 'all',
            'stylers': {
              'color': '#d1d1d1'
            }
          }, {
            'featureType': 'label',
            'elementType': 'labels.text.fill',
            'stylers': {
              'color': '#999999'
            }
          }]
        }
      },
      series: [
        {
          name: 'Value',
          type: 'scatter',
          coordinateSystem: 'bmap',
          data: searchData,
          symbolSize: function (val) {
            return val[2] / $scope.vis.params.symbolSize;
          },
          label: {
            normal: {
              formatter: '{b}',
              position: 'right',
              show: false
            },
            emphasis: {
              show: true
            }
          },
          itemStyle: {
            normal: {
              color: 'purple'
            }
          }
        }
      ]
    };

    MP().then(BMap => {
      myChart.setOption(option, true);
    }).catch(error =>{
      console.log('error');
      myChart.setOption(option, true);
    });

  });

});


function BmapVisType(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);
  return VisFactory.createAngularVisualization({
    name: 'echarts bmap',
    title: 'Echarts bmap',
    icon: 'fa fa-map',
    description: 'Plugin of Echarts Bmap',
    category: CATEGORY.MAP,
    visConfig: {
      defaults: {
        field: 'filed1',
        color: '#fff',
        symbolSize: 100,
        bmapText: '全国主要城市空气质量 - 百度地图',
        bmapSubText: 'data from PM25.in'
      },
      template: BmapTemplate
    },
    hierarchicalData: true,
    responseHandler: 'none',
    editorConfig: {
      optionsTemplate: EditorTemplate,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          aggFilter: '!geo_centroid',
          min: 1,
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'buckets',
          name: 'longitude',
          title: 'Longitude',
          min: 1,
          max: 1,
          aggFilter: 'terms'
        },
        {
          group: 'buckets',
          name: 'latitude',
          title: 'Latitude',
          min: 1,
          max: 1,
          aggFilter: 'terms'
        },
        {
          group: 'buckets',
          name: 'docvalue',
          title: 'Docvalue',
          min: 1,
          max: 1,
          aggFilter: 'terms'
        },
        {
          group: 'buckets',
          name: 'symbolcolor',
          title: 'SymbolColor',
          min: 1,
          max: 1,
          aggFilter: 'terms'
        }
      ])
    } 
  });
}
VisTypesRegistryProvider.register(BmapVisType);
export default BmapVisType;

