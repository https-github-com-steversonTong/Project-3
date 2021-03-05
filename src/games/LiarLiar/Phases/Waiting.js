import LiarLiarContext from "../utils/LiarLiarContext";
import UserCard from "../../../components/UserCard";
import PortalCodeCard from "../../../components/LobbyCards/PortalCodeCard";
import PlayButton from "../PlayButton";
import GameTitle from "../GameTitle";
import BBLogo from "../../../components/BBLogo";
import bb from "../../../utils/babelBread";
import { useGame } from "../BabelBuilder/GameContext";

const Waiting = () => {
  const gameState = useGame();
  const startRound = async () => {
    console.log('hello');
    const question = await bb().browse('questions').random(); //Faster Random
    console.log(question);
    const portal = await bb().edit('portals', { code: gameState.code }, {
      "params.phase": 'question'
    })
    const newRound = await bb().push('portals', { code: gameState.code }, {
      "params.rounds": {
        round: gameState.rounds.length++,
        question: question,
        answers: [],
        questionStartTime: Date.now(),
        answerStartTime: Date.now() + 30000
      }
    });
    console.log(newRound);
  };

  return (
    <>
      <GameTitle
        className="font-bold w-full my-4 flex items-center justify-between bg-babelBlue-600 text-yellow-600 p-4 lg:text-5xl md:text-5xl text-3xl text-center rounded-xl tracking-widest"
        src="https://twemoji.maxcdn.com/v/13.0.1/72x72/1f925.png"
        name="Liar Liar"
      />
      <PlayButton onClick={startRound} />
      <PortalCodeCard portalCode={gameState.code} />
      {gameState.players &&
        gameState.players.map((user, index) => {
          return <UserCard key={index} user={{ ...user }}  />;
        })}
    </>
  );
};

export default Waiting;
