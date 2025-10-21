let blockchain = JSON.parse(localStorage.getItem('blockchain') || '[{"index":0,"data":"genesis","prevHash":"0","hash":"genesis"}]');
let coins = parseInt(localStorage.getItem('coins') || 0);
let votes = JSON.parse(localStorage.getItem('votes') || '{}');

document.getElementById('reward').innerText = 'Your Reward: ' + coins + ' Coins';

function calculateHash(data, prevHash) {

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16) + prevHash.substring(0,4);
}

function addBlock(data) {
    const lastBlock = blockchain[blockchain.length - 1];
    const newBlock = {
        index: lastBlock.index + 1,
        data: data,
        prevHash: lastBlock.hash,
        hash: calculateHash(data, lastBlock.hash),
        timestamp: new Date().toISOString()
    };
    blockchain.push(newBlock);
    localStorage.setItem('blockchain', JSON.stringify(blockchain));
}

function submitVote() {
    const selected = document.querySelector('input[name="vote"]:checked');
    if (!selected) {
        alert('Please select an option.');
        return;
    }

    const answer = selected.value;
    const question = 'invasion';

    if (!votes[question]) {
        votes[question] = { yes: 0, no: 0 };
    }
    votes[question][answer]++;
    localStorage.setItem('votes', JSON.stringify(votes));
    localStorage.setItem('userVoted', answer);
    addBlock('vote: ' + answer + ' on ' + question);

    coins += 1;
    addBlock('reward: +1 coin for voting');
    localStorage.setItem('coins', coins);
    document.getElementById('reward').innerText = 'Your Reward: ' + coins + ' Coins';

    // Simple game: guess majority
    const totalYes = votes[question].yes;
    const totalNo = votes[question].no;
    const userGuess = answer === 'yes';
    const isYesMajority = totalYes > totalNo;
    if ((userGuess && isYesMajority) || (!userGuess && !isYesMajority)) {
        coins += 2;
        addBlock('reward: +2 coins for majority game');
        localStorage.setItem('coins', coins);
        document.getElementById('reward').innerText = 'Your Reward: ' + coins + ' Coins';
        alert('You picked the majority! Extra 2 coins.');
    }

    alert('Vote submitted! You earned 1 coin.');
}

// Share
if ('share' in navigator) {
    const shareBtn = document.createElement('button');
    shareBtn.innerText = 'Share App';
    shareBtn.classList.add('submit-btn');
    shareBtn.onclick = () => {
        navigator.share({
            title: 'Geopolitical Voting App',
            text: 'Vote on geo issues and earn LIGHTCOIN!',
            url: window.location.href
        }).then(() => {
            coins += 5;
            addBlock('reward: +5 coins for sharing');
            localStorage.setItem('coins', coins);
            document.getElementById('reward').innerText = 'Your Reward: ' + coins + ' Coins';
            alert('Shared! Earned 5 coins.');
        });
    };
    document.querySelector('.container').appendChild(shareBtn);
}

// Export blockchain
function exportBlockchain() {
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(blockchain, null, 2);
    document.querySelector('.container').appendChild(pre);
}

const exportBtn = document.createElement('button');
exportBtn.innerText = 'Export Blockchain (for conversion later)';
exportBtn.classList.add('submit-btn');
exportBtn.onclick = exportBlockchain;
document.querySelector('.container').appendChild(exportBtn);
