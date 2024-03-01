const buttonTableMakerHTML = document.querySelector("#buttonTableMaker");
const buttonAddTickerHTML = document.querySelector("#buttonAddTicker");
const buttonAddCurrencyHTML = document.querySelector("#buttonAddCurrency");
const buttonAddExchangeHTML = document.querySelector("#buttonAddExchange");
const ulTickersTableHTML = document.querySelector("#TickersTable");
const ulCurrencyTableHTML = document.querySelector("#CurrencyTable");
const ulExchangesTableHTML = document.querySelector("#ExchangesTable");
const inputBoxTickerHTML = document.querySelector("#inputBoxTicker");
const inputBoxGeographyHTML = document.querySelector("#inputBoxGeography");
const inputCheckMainCurrencyHTML = document.querySelector("#inputCheckMainCurrency");
const inputBoxCurrencyHTML = document.querySelector("#inputBoxCurrency");
const inputBoxExchangeHTML = document.querySelector("#inputBoxExchange");
const currencyTableHTML = document.querySelector("#CurrencyTable");
const tickersTableHTML = document.querySelector("#TickersTable");
const exchangesTableHTML = document.querySelector("#ExchangesTable");
const stockTableHTML = document.querySelector("#stockTable");
const tickerSelectPortfolioHTML = document.querySelector("#tickerSelectPortfolio");
const exchangeSelectPortfolioHTML = document.querySelector("#exchangeSelectPortfolio");
const numberSelectPortfolioHTML = document.querySelector("#numberSelectPortfolio");
const buttonAddToPortfolioHTML = document.querySelector("#buttonAddToPortfolio")
const divportfolioHTML = document.querySelector("#portfolio");
const buttonClearHTML = document.querySelector("#buttonClear");
const currencySelectTickerHTML = document.querySelector("#currencySelectTicker");

const apiStocks = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="; //IBM&apikey=demo";
const apiKeyStocks = "&apikey=RZZMK9BMMJUJI6EB"
const apiCurrencyExchange = "https://open.er-api.com/v6/latest/CHF";
const sQuery = new URLSearchParams(window.location.search);

function addToObject(obj, key, val = true){
    if(obj.hasOwnProperty(key)){
        obj[key].push(val);
    }
    else{
        obj[key] = [val];
    }
}

async function fetchExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
}

async function fetchStockData(symbol) {
    try {
        const response = await fetch(apiStocks + symbol + apiKeyStocks);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return null;
    }
}


async function constructTable() {
    let geographies = new Object();
    let currencies = new Object();
    let exchanges = new Object();
    let mainCurrency = null;

    
    Array.from(document.getElementsByClassName("tickerInUse")).forEach(element => {
        addToObject(geographies, element.getAttribute("geography"), {
            ticker:element.getAttribute("ticker"),
            currency:element.getAttribute("currency")
        });
    });
    Array.from(document.getElementsByClassName("currencyInUse")).forEach(element => {
        addToObject(currencies, element.getAttribute("currency"));
        if(element.hasAttribute("id") && element.getAttribute("id") == "mainCurrency") mainCurrency = element.getAttribute("currency");
    });
    Array.from(document.getElementsByClassName("exchangeInUse")).forEach(element => {
        addToObject(exchanges, element.getAttribute("exchange"));
    });
    let numCurrencies = Object.keys(currencies).length;
    let numExchanges = Object.keys(exchanges).length;
    let numTickers = 0;
    Object.keys(geographies).forEach(geography => {numTickers += geographies[geography].length});
    let rows = numTickers + 3;
    let columns = numCurrencies + numExchanges + 3;

    //counting how many shares each exchange has for each portfolio
    let rowPortfolio = {};
    Object.keys(geographies).forEach(geography => {
        geographies[geography].forEach(ticker => {
            rowPortfolio[ticker.ticker] = 0;
        })
    });
    let portfolio = {};
    Object.keys(exchanges).forEach(exchange => {
        let clonePortfolio = { ...rowPortfolio };
        portfolio[exchange] = clonePortfolio;
    });
    Array.from(document.getElementsByClassName("portfolioInUse")).forEach(element => {
        portfolio[element.getAttribute("exchange")][element.getAttribute("ticker")] += Number(element.getAttribute("amount"));
    });

    //Creates output matrix template
    let rowData = [];
    let matrixData = [];
    for(let i = 0; i < columns; i++){
        rowData.push("");
    }
    for(let i = 0; i < rows; i++){
        copyRowData = [...rowData];
        matrixData.push(copyRowData);
    }

    let exchangeRates = fetchExchangeRates();
    matrixData[0][2] = "Price per share";
    matrixData[0][2 + numCurrencies] = "Number of shares";
    matrixData[0][2 + numCurrencies + numExchanges] = "Total value in " + mainCurrency;
    for(let i = 0; i < numCurrencies; i++){
        matrixData[1][i + 2] = Object.keys(currencies)[i];
    }
    for(let i = 0; i < numExchanges; i++){
        matrixData[1][i + 2 + numCurrencies] = Object.keys(exchanges)[i];
    }
    let row = 2;
    let totalValue = 0;
    Object.keys(geographies).forEach(async geography => {
        matrixData[row][0] = geography;
        await geographies[geography].forEach(async ticker => {
            matrixData[row][1] = ticker.ticker;
            const stockData = await fetchStockData(ticker.ticker);
            console.log(stockData);
            let lastDay = stockData["Meta Data"]["3. Last Refreshed"];
            console.log(lastDay);
            let p = Number(stockData["Time Series (Daily)"][lastDay][4]);
            console.log(p);
            // Fill out the whole row of the ticker
            let column = 2;
            Object.keys(currencies).forEach(currency => {
                matrixData[row][column] = p*Number(currency)/Number(exchangeRates[ticker.currency]);
                if(currency == mainCurrency)
                    price = matrixData[row][column];
                column += 1;
            });
            Object.keys(exchanges).forEach(exchange => {
                matrixData[row][column] = portfolio[exchange][ticker.ticker];
                stocks += portfolio[exchange][ticker.ticker]
                column += 1;
            });
            matrixData[row][column] = price * stocks;
            totalValue += matrixData[row][column];
            row += 1;
        })
    });

    //adding last entry
    matrixData[rows-1][columns-1] = totalValue;

    stockTableHTML.innerHTML = matrixToMarkdown(matrixData);
}

function addTicker(ticker, geography, currency){
    ulTickersTableHTML.innerHTML += '<li class="tickerInUse" ticker="' + ticker + '"  currency="' + currency + '"  geography="' + geography + '">' + ticker + '</li>';
    tickerSelectPortfolioHTML.innerHTML += '<option>' + ticker + '</option>';
}
function addCurrency(currency, checked){
    let str = '<li class="currencyInUse" currency="' + currency + '" ';
    if(checked){
        document.querySelector("#mainCurrency").removeAttribute("id");
        str += 'id="mainCurrency" ';
    }
    str += '>' + currency + '</li>';
    ulCurrencyTableHTML.innerHTML += str;
    currencySelectTickerHTML.innerHTML += '<option>' + currency + '</option>';
}
function addExchange(exchange){
    ulExchangesTableHTML.innerHTML += '<li class="exchangeInUse" exchange="' + exchange + '" >' + exchange + '</li>';
    exchangeSelectPortfolioHTML.innerHTML += '<option>' + exchange + '</option>';
}
function addToPortfolio(ticker, exchange, amount){
    let str = '<li class="portfolioInUse" ticker="' + ticker + '" exchange="' + exchange + '" amount="' + amount + '">' + amount + ' shares in ' + ticker + ' saved in ' + exchange + '</li>';
    divportfolioHTML.innerHTML += str;
}

buttonTableMakerHTML.addEventListener('click', constructTable);
buttonAddTickerHTML.addEventListener('click', () => {
    if(inputBoxTickerHTML.value == "") return;
    addTicker(inputBoxTickerHTML.value, inputBoxGeographyHTML.value, currencySelectTickerHTML.value);
    inputBoxTickerHTML.value = "";
    inputBoxGeographyHTML.value = "";
});
buttonAddCurrencyHTML.addEventListener('click', () => {
    if(inputBoxCurrencyHTML.value == "") return;
    addCurrency(inputBoxCurrencyHTML.value, inputCheckMainCurrencyHTML.checked);
    inputBoxCurrencyHTML.value = "";
    inputCheckMainCurrencyHTML.checked = false;
});
buttonAddExchangeHTML.addEventListener('click', () => {
    if(inputBoxExchangeHTML.value == "") return;
    addToPortfolio(inputBoxExchangeHTML.innerHTML);
    inputBoxExchangeHTML.innerHTML = "";
});
buttonAddToPortfolioHTML.addEventListener('click', () => {
    if(numberSelectPortfolioHTML.value == 0) return;
    addToPortfolio(tickerSelectPortfolioHTML.value, inputBoxGeographyHTML.value, currencySelectTickerHTML.value);
})
buttonClearHTML.addEventListener('click', clearHMI)

function clearHMI(){
    tickerSelectPortfolioHTML.innerHTML = "";
    exchangeSelectPortfolioHTML.innerHTML = "";
    ulTickersTableHTML.innerHTML = "";
    ulExchangesTableHTML.innerHTML = "";
    ulCurrencyTableHTML.innerHTML = "";
    currencySelectTickerHTML.innerHTML = "";
    divportfolioHTML.innerHTML = "";
}

function matrixToMarkdown(matrix) {
    // Start Markdown table
    let markdown = '|';
    
    // Add headers
    for (let j = 0; j < matrix[0].length; j++) {
        markdown += ` ${matrix[0][j]} |`;
    }
    markdown += '\n';
    
    // Add separator
    for (let j = 0; j < matrix[0].length; j++) {
        markdown += '| --- ';
    }
    markdown += '|\n';
    
    // Add rows
    for (let i = 1; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            markdown += `| ${matrix[i][j]} `;
        }
        markdown += '|\n';
    }
    
    return markdown;
}


document.addEventListener('DOMContentLoaded', async () => {
    if (sQuery.size > 0){
        let currencies = new Object();
        let tickers = new Object();
        let exchanges = new Object();
        let portfolio = new Object();
        let mainCurrency = null;
        sQuery.forEach(async (value, key, searchParams) => {
            //key="stock"
            //value = ticker > geography
            if(key == "stock"){
                let myArray = value.split(">");
                let ticker = myArray[0];
                let geography = myArray[1];
                addToObject(tickers, ticker, geography);
            }
            //key="currency"
            //value = currency
            else if(key == "currency"){
                addToObject(currencies, value);
            }
            //key="maincurrency"
            //value = currency
            else if(key == "maincurrency"){
                addToObject(currencies, value);
                mainCurrency = value;
            }
            //key="exchange"
            //value = exchange
            else if(key == "exchange"){
                addToObject(exchanges, value);
            }
            //key="portfolio"
            //value = ticker > exchange > amount
            else if(key == "portfolio"){
                let myArray = value.split(">");
                let ticker = myArray[0];
                let exchange = myArray[1];
                let amount = myArray[2];
                addToObject(portfolio, ticker, {exchange : exchange, amount : amount});
            }
        });

        //clear current HMI
        clearHMI();

        //fill up HMI
        Object.keys(currencies).forEach(curr => {
            if(currencies[curr][0] == mainCurrency){
                addCurrency(curr, true);
            } else{
                addCurrency(curr, false);
            }
        });
        
        Object.keys(exchanges).forEach(exchange => {
            addExchange(exchange);
        });
        
        Object.keys(tickers).forEach(ticker => {
            addTicker(ticker, tickers[ticker][0]);
        });
        
        Object.keys(portfolio).forEach(ticker => {
            portfolio[ticker].forEach(exchange => {
                addToPortfolio(ticker, exchange.exchange, exchange.amount)
            })
            addToPortfolio(ticker, tickers[ticker][0]);
        });
    }
    //Construct tables
    await constructTable();
});





