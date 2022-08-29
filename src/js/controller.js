import 'core-js/stable';
import 'regenerator-runtime/runtime.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import searchResultsView from './views/searchResultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { CLOSE_MODEL_SEC, RERENDER_MODEL_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function () {
  try {
    // 1) get id of the recipe
    const id = window.location.hash.slice(1);
    if (!id) return;
    // 2) render spinner while loading the recipe
    recipeView.renderSpinner();
    // 3) load and store the recipe

    await model.loadRecipe(id);
    console.log(model.state.recipe);
    // 4) render the recipe
    recipeView.render(model.state.recipe);
    // 5) update search results view and bookmarks
    searchResultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) load and store search results
    searchResultsView.renderSpinner();
    await model.loadSearchResults(query);

    // 3) render search results
    searchResultsView.render(model.getSearchResultsPage());

    // 4) render pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (page) {
  // render page
  searchResultsView.render(model.getSearchResultsPage(page));

  // render pagination
  paginationView.render(model.state.search);
};

const controlServings = function (serving) {
  // 1) update the recipe serving in state
  model.updateServings(serving);

  // 2) rerender the new recipe
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlBookmark = function () {
  // 1) add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // 2) update recipe view
  recipeView.update(model.state.recipe);
  // 3) render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlRenderBookmark = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // 0) render spinner
    addRecipeView.renderSpinner();
    // 1) send recipe to the server
    await model.uploadRecipe(newRecipe);
    // 2) add newRecipe to Bookmark
    model.addBookmark(model.state.recipe);
    // 3) render newRecipe to the DOM
    recipeView.render(model.state.recipe);
    // 4) render success message
    addRecipeView.renderMessage();
    // 5) render new bookmarks
    bookmarksView.render(model.state.bookmarks);
    // 6) change id in the window to newRecipe.id
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // 7) close form window
    setTimeout(function () {
      addRecipeView.toggleModel();
    }, CLOSE_MODEL_SEC * 1000);
    // 8) return form window to the original state
    setTimeout(function () {
      addRecipeView.render(true);
    }, RERENDER_MODEL_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlRenderBookmark);
  recipeView.addHandlerRender(controlRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlBookmark);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
