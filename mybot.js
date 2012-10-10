// board info
var board_height;
var board_width;
var types_of_fruit;

var fruit_counts;
var rare_fruit = 0;

// use this as a 'reset' value for rare_fruit
var total_fruit = 0;

// current goal
var target = [-1, -1];
var target_dist;

// highest priority targets
var hitlist = [];

// ignore everything else, just get to the target and pick it up
// use for category-winning situations (i.e. when only 1 of a fruit exists)
var sprintMode;

// called at the beginning of a new game, probably a decent place to get 
// one-time info e.g. board size, fruit rarity/placement, etc
function new_game() {
   var board = get_board();

   board_height = HEIGHT;
   board_width = WIDTH;

   types_of_fruit = get_number_of_item_types();
   fruit_counts = new Array(types_of_fruit + 1);

   for (var i = 1; i < fruit_counts.length; i++) {
      var item_count = get_total_item_count(i);
      fruit_counts[i] = item_count;
      total_fruit += item_count;

      if ((fruit_counts[i] > 0 && fruit_counts[i] < rare_fruit) || rare_fruit === 0){
         rare_fruit = i;
      }
   };

   sprintMode = true;

   // get initial target
   find_rare_fruit();

   var d_to_t = distance_to_target(target[0],target[1]);

   // cancel sprintMode if too deep
   if (d_to_t > board_width || d_to_t > board_height) {
      sprintMode = false;
   }

   //most_fruitful_quadrant();
   //trace("x: " + board_width + " y: " + board_height + " d: " + distance_to_target(target[0],target[1]));
}

// find the rarest & closest fruit that is still worthwhile
function find_rare_fruit(){
   var board = get_board();

   board_height = HEIGHT;
   board_width = WIDTH;

   // reset the rare to a high number, without making assumptions
   // e.g. they could just make a board with 10000 bananas
   rare_fruit = total_fruit;
   
   // reset distance to largest possible value
   target_dist = board_width + board_height;

   update_fruit_counts();

   for (var i = 1; i < fruit_counts.length; i++) {
      if (is_still_worthwhile(i) && fruit_counts[i] > 0 && fruit_counts[i] < rare_fruit){
         rare_fruit = i;         
      }
   };

   // scan the board for the rare fruit(s?)
   // todo : probably shouldn't assume there is only one
   for (var x = 0; x < board_width; x++){
      for (var y = 0; y < board_height; y++){
         if (board[x][y] === rare_fruit && is_still_worthwhile(board[x][y])){
            if (distance_to_target(x, y) < target_dist){
               target = [x, y];
               target_dist = distance_to_target(x, y);
               //break;
            }
         }
      }
   }
}

// go thru and check to see if bots have taken fruit
function update_fruit_counts() {
   for (var i = 1; i < fruit_counts.length; i++) {
      fruit_counts[i] = get_total_item_count(i)-(get_my_item_count(i)+get_opponent_item_count(i));
   };
}

// this is the main function called by the game server
function make_move() {
   var board = get_board();
   var my_x = get_my_x();
   var my_y = get_my_y();

   // check for sprintMode first
   if (sprintMode === true && target_still_exists(target) && is_still_worthwhile(board[my_x][my_y])) {
      if (my_x === target[0] && my_y === target[1]){
         return TAKE;
      }
      else {
         return move_toward_target(target);
      }
   }

   // we found an item! take it!
   if (board[my_x][my_y] > 0 && is_still_worthwhile(board[my_x][my_y])) {
      return TAKE;
   }

   // if RIGHT NEXT to a fruit, and it's worthwhile, get it
   if (my_y - 1 >= 0 && board[my_x][my_y - 1] > 0 && is_still_worthwhile(board[my_x][my_y - 1])) {
      return NORTH;
   }   
   if (my_x + 1 < board_width && board[my_x + 1][my_y] > 0 && is_still_worthwhile(board[my_x + 1][my_y])) {
      return EAST;
   }
   if (my_x - 1 >= 0 && board[my_x - 1][my_y] > 0 && is_still_worthwhile(board[my_x - 1][my_y])) {
      return WEST;
   }
   if (my_y + 1 < board_height && board[my_x][my_y + 1] > 0  && is_still_worthwhile(board[my_x][my_y + 1])) {
      return SOUTH;
   }

   // otherwise, we're on a mission... 
   if (target_still_exists(target) && is_still_worthwhile(board[target[0]][target[1]])){
      return move_toward_target(target);
   }
   else {
      get_new_target();
      return move_toward_target(target);
   }
}

// move in the direction of your target, but always be on the lookout for items
// in your path (that can be reached without adding extra moves)
function move_toward_target(target_coords) {
   var board = get_board();
   var my_x = get_my_x();
   var my_y = get_my_y();

   // target_coords has [x,y]
   if (my_x < target_coords[0]) {return EAST}
   else if (my_x > target_coords[0]) {return WEST}
   else if (my_y > target_coords[1]) {return NORTH}
   else if (my_y < target_coords[1]) {return SOUTH}
}

// This should eventually get the next fruit on the
// rare fruit list (if still worthwhile, and if still exists)
function get_new_target() {
   sprintMode = false;
   find_rare_fruit();
}

function target_still_exists(target_coords) {
   var board = get_board();

   if (board[target_coords[0]][target_coords[1]] > 0) {   
      return true;
   }

   else {
      return false;
   }
}

// if someone has more than half of a fruit type, it
// is no longer worthwhile
function is_still_worthwhile(fruit_type) {
   var winning_amt = Math.floor(get_total_item_count(fruit_type) / 2) + 1;
   var opp_amt = get_opponent_item_count(fruit_type);
   var my_amt = get_my_item_count(fruit_type);

   if (my_amt >= winning_amt) {
      return false;
   }
   if (opp_amt >= winning_amt) {
      return false;
   }

   return true;
}


// returns the necessary number of moves for player to get to a given [x,y]
function distance_to_target(x_coord, y_coord) {
   var board = get_board();
   var my_x = get_my_x();
   var my_y = get_my_y();

   return Math.abs(my_x - x_coord) + Math.abs(my_y - y_coord);
}

// split the board into 4ths, figure out which has the most fruit
function most_fruitful_quadrant() {
   var board = get_board();
   var NW = 0;
   var NE = 0;
   var SW = 0;
   var SE = 0;

   var half_width = WIDTH / 2;
   var half_height = HEIGHT / 2;

   for (var x = 0; x < WIDTH; x++) {
      for (var y = 0; y < HEIGHT; y++) {
         if (board[x][y] > 0){
            if (x < half_width - 1 && y < half_height - 1) { NW += 1;}
            if (x > half_width - 1 && y < half_height - 1) { NE += 1;}
            if (x < half_width - 1 && y > half_height - 1) { SW += 1;}
            if (x > half_width - 1 && y > half_height - 1) { SE += 1;}
         }
      };            
   };   
}


// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
// function default_board_number() {
//    return 445381; // this is a fun, fruit-dense lvl
// }
