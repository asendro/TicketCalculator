class TicketType {
    constructor(type) {
        this.type = type;
        return this;
    }

    getType() {
        return this.type;
    }
}

class BetslipCalculator {

    constructor() {
        this.bets = [];
        this.systems = [];
        this.stake = 0.95;
        this.ticketType = new TicketType('SYSTEM').getType();
    }

    setBets(bets) {
        this.bets = bets;
        this.generateSystems();
    }

    getBankers() {
        return this.bets.filter(bet => bet.banker);
    }

    getNonBankers() {
        return this.bets.filter(bet => !bet.banker);
    }

    getBankersSum() {
        let sum = 1;
        this.getBankers().forEach(bet => sum *= bet.oddValue);
        return sum;
    }

    generateSystems() {
        const nonBankers = this.getNonBankers();
        this.systems = [];

        nonBankers.forEach((item, i) => {
            const system = {
                id: i + 1,
                of: nonBankers.length,
                active: false,
                stake: this.stake,
                combinations: getNumberOfCombs(i + 1, nonBankers.length)
            };

            system.stakePerCombination = this.stake / system.combinations;

            this.systems.push(system);
        });
    }

    toggleSystem(id) {
        const index = this.systems.findIndex(system => system.id === id);
        this.systems[index].active = !this.systems[index].active;
    }

    setStake(stake) {
        this.stake = stake;
    }

    getSelectedSystems() {
        return this.systems.filter(system => system.active);
    }

    getStakePerSystem() {
        const selectedSystems = this.getSelectedSystems();

        let combinations = 0;

        selectedSystems.forEach(item => combinations += item.combinations);

        return this.stake / combinations;
    }

    calculateSystemWinnings() {
        const nonBankers = this.getNonBankers();
        const bankers = this.getBankers();

        const stakePerSystem = this.getStakePerSystem();

        let maxWinning = 0;

        let bankersSum = 1;

        bankers.forEach(item => bankersSum *= item.oddValue);

        let combsOdds = [];

        nonBankers.forEach(item => {
            combsOdds.push(item.oddValue);
        });

        const selectedSystems = this.getSelectedSystems();

        for (let i = 0; i < selectedSystems.length; i++) {
            let systemOddsSum = [];
            selectedSystems[i].maxWinning = 0;

            getSystemCombsOdds(combsOdds, selectedSystems[i].id, (arrayComb) => {
                let sum = 1;

                for (let j = 0; j < arrayComb.length; j++) {
                    sum *= arrayComb[j];
                }

                systemOddsSum.push(sum);
            });

            for (let k = 0; k < systemOddsSum.length; k++) {
                selectedSystems[i].maxWinning += (systemOddsSum[k] * bankersSum * stakePerSystem);
            }

            maxWinning += selectedSystems[i].maxWinning;
        }

        return maxWinning;
    }

}

const getSystemCombsOdds = (systemOdds, systemLoweNumber, callback) => {
    let n = systemOdds.length;
    let c = [];
    const inner =  (start, choose_) => {
        if (choose_ == 0) {
            callback(c);
        } else {
            for (let i = start; i <= n - choose_; ++i) {
                c.push(systemOdds[i]);
                inner(i + 1, choose_ - 1);
                c.pop();
            }
        }
    };
    inner(0, systemLoweNumber);
}

const getNumberOfCombs = (num1, num2) => {
    const { lower, higher } = { lower: num1 > num2 ? num2 : num1, higher: num1 > num2 ? num1 : num2 };

    let x = 1;
    let y = 1;

    for (let i = higher; i > (higher - lower); i -= 1) {
        x *= i;
    }

    for (let i = lower; i > 0; i -= 1) {
        y *= i;
    }

    return parseFloat(x) / parseFloat(y);
};

const betslipCalc = new BetslipCalculator();

const bets = [
    {
        banker: false,
        oddValue: 1.85
    },
    {
        banker: false,
        oddValue: 2.00
    },
    {
        banker: false,
        oddValue: 1.40
    },
    {
        banker: true,
        oddValue: 2.10
    },
    {
        banker: true,
        oddValue: 1.65
    }
];

betslipCalc.setBets(bets);

betslipCalc.toggleSystem(3);
betslipCalc.toggleSystem(1);
// betslipCalc.toggleSystem(5);
betslipCalc.calculateSystemWinnings();