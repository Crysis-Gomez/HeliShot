 <?php 
 
 $commentsText = file_get_contents("highscores.json");
 $commentsList=json_decode($commentsText,true);
 
 $data = $_POST['data'];
 $playerscore = $_POST['score'];

 switch ($data)
 {
	case 'first':
		$commentsList['third'][score] = $commentsList['second'][score];
		$commentsList['second'][score] = $commentsList['first'][score];
		$commentsList['first'][score] = $playerscore+0;
	break;
	
	case 'second':
		
		$commentsList['third'][score] = $commentsList['second'][score];
		$commentsList['second'][score] = $playerscore+0;
	break;

	case 'third':
		$commentsList['third'][score] = $playerscore+0;
   
   default:
   echo "no changes";
 }
 
 echo $commentsList['first'][score];
 echo $commentsList['second'][score];
 echo $commentsList['third'][score];
 
 $commentsText = json_encode($commentsList);
 
 $commentsFile = "highscores.json";
 
 file_put_contents($commentsFile, $commentsText)

 
 
 ?> 
