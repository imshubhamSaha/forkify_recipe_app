import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

//Subscriber to recipeView
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0 . Update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());
    bookmarkView.update(model.state.bookmarks);

    //1.Loading Recipe
    await model.loadRecipe(id);

    //2. Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    // console.error(err);
  }
};
//Subscriber to searchView
const controlSearchResults = async function () {
  try {
    // 1. get the Search query
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();

    //2. Load the search query
    await model.loadSearchResults(query);

    //3. Render Search Result

    resultsView.render(model.getSearchResultPage());

    //4. Render initial Pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goTOPage) {
  //1. Render New Search Result
  resultsView.render(model.getSearchResultPage(goTOPage));

  //4. Render New Pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newservings) {
  //Update the Recipe Servings(in state)
  model.updateServings(newservings);
  // Update the recipe views
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1) Add/remove BookMarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2) Update recipe View
  recipeView.update(model.state.recipe);

  //3) Render Book marks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading Spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    // Render bookmarks View
    bookmarkView.render(model.state.bookmarks);

    // Success message
    addRecipeView.renderSuccessMessage();

    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close Form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
