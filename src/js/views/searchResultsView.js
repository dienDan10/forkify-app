import View from './View';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView';

class SearchResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query! Please try again :)';
  _message = '';
  _generateMarkup() {
    const id = window.location.hash.slice(1);

    return previewView.generateMarkup(this._data);
  }
}

export default new SearchResultsView();
