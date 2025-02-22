# Random Nonogram

[Play it here!](https://codepen.io/Cau-Shimoda/full/KwKMVJE)

[Nonogram](https://en.wikipedia.org/wiki/Nonogram) is a logic puzzle game where you have to find out which pixels, or squares, should be filled. To do this, you should use the numbers on the edges of the grid to guide you.

The numbers show how many squares are filled in sequence in that row or column. When the numbers are separated, it means there's a gap between them of at least, but not necessarily, 1 empty square. 

Example: in a row with the numbers 1 2 1 on its edge, there should be a single filled square, then a gap of at least 1 empty square, then 2 adjacent filled squares, another gap, and finally another single filled square. 
No other square should be filled in that row. 

Remember that the numbers don't tell you explicitly which square in that row or column is the first filled one, but sometimes you can deduce logically where to start depending on the numbers and the relationship between crossed rows and columns. 

Normally, a Nonogram forms a picture when completely filled, but as Random Nonogram is random, it won't show any recognizable picture.

## Using the X

The X is an element that you can use as a reminder that a given square cannot logically be filled. This will help you solve the puzzle, and the game understands a X filled square as an empty square, not a filled one.

## Reveal Square

When you have more than 0 "Reveal Square" left, you can use it to reveal a random square. It might reveal that a currently empty square is actually filled, or that a square filled incorrectly by the player is actually empty. 
