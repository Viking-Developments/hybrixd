var U = utils;
var M = manageAssets;
var Icons = black;

var tableHTMLStr = '<div class="table">' +
    '<div class="thead">' +
    '<div class="tr">' +
    '<div class="th col1">Asset</div>' +
    '<div class="th col2" style="text-align:right;">Add / remove from wallet</div>' +
    '</div>' +
    '</div>' +
    '<div class="tbody">';

var clearBtns = [
  document.querySelector('#manageAssetsBtn'),
  document.querySelector('.clearable__clear')
];

var clearBtnsStream = clearBtns
    .map(function (elem) { return Rx.Observable.fromEvent(elem, 'click'); });

var searchAssetsStream = Rx.Observable
    .fromEvent(document.querySelector('#search-assets'), 'input')
    .startWith({target: {value: ''}})
    .map(U.getTargetValue);

var searchBarStream = searchAssetsStream
    .map(R.toLower)
    .map(query => {
      return R.compose(
        R.keys,
        R.fromPairs,
        R.filter(queryMatchesEntry(query)),
        R.toPairs
      )(GL.assetnames);
    });

var clearSearchBarStream = Rx.Observable
  .merge(clearBtnsStream)
    .map(function (_) {
      var searchBar = document.querySelector('#search-assets');
      searchBar.innerHTML = '';
      searchBar.value = '';
      U.triggerEvent(searchBar, 'input');
    });

function mkSearchedAssetHTMLStr (acc, entry) {
  var symbolName = entry.slice(entry.indexOf('.') + 1);
  var icon = U.mkIcon(symbolName);
  var entryExists = R.any(R.propEq('id', entry), GL.assets);
  var element = entry.replace('.', '-');

  var assetIconHTMLStr = '<div class="icon">' + icon + '</div>';
  var assetIDHTMLSTr = '<div class="asset">' + entry.toUpperCase() + '</div>';
  var assetFullNameHTMLStr = '<div class="full-name">' + GL.assetnames[entry] + '</div>';
  var actionBtns = '<div class="assetbuttons assetbuttons-' + element + '">' + M.renderManageButton(element, entry, entryExists) + '</div>';

  var htmlStr = '<div class="tr">' +
        '<div class="td col1">' + assetIconHTMLStr + assetIDHTMLSTr + assetFullNameHTMLStr + '</div>' +
        '<div class="td col2 actions">' + actionBtns + '</div>' +
        '</div>';
  return acc + htmlStr;
}

function queryMatchesEntry (query) {
  return function (entry) {
    var assetID = R.toLower(R.nth(0, entry));
    var assetName = R.toLower(R.nth(1, entry));
    return R.test(new RegExp(query, 'g'), assetID) ||
      R.test(new RegExp(query, 'g'), assetName);
  };
}

clearSearchBarStream.subscribe();
searchBarStream.subscribe(function (matchedEntries) {
  var assetsHTMLStr = R.reduce(mkSearchedAssetHTMLStr, '', matchedEntries);
  var output = tableHTMLStr + assetsHTMLStr + '</div></div>';
  document.querySelector('.data.manageAssets').innerHTML = output; // insert new data into DOM
});
searchAssetsStream.subscribe(function (value) {
  var displayValue = R.equals(value, '') ? 'none' : 'inline';
  document.querySelector('.clearable__clear').style.display = displayValue;
});
