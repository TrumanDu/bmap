export default function (kibana) {
  return new kibana.Plugin({
    name: 'bmap',
    require: ['elasticsearch'],
    uiExports: {
      visTypes:['plugins/bmap/bmap']
    },
  });
};
