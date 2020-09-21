
//BUDGET CONTROLLER
var budget_controller = (function () {
    var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }

    Expense.prototype.calPercentage = function (totalIncome) {
      if(totalIncome > 0)
      this.percentage = Math.round((this.value / totalIncome)*100);
    };

    Expense.prototype.getPercentage = function () {
      return this.percentage;
    };

    var Income = function(id, description, value){
      this.id = id;
      this.description = description
      this.value = value
    }

    var calculateTotal = function(type){
      var sum = 0;
      data.allItems[type].forEach(function(cur){
        sum += cur.value;
      });
      data.totals[type] = sum;
    }

    var data = {
      allItems:{
        exp: [],
        inc: []
      },
      totals :{
        exp : 0,
        inc : 0
      },
      budget: 0,
      percentage : -1
    }

    return {
      addItem : function (type, des,  val){
        var newItem, ID;

        ID = 0; //create new id
        if(data.allItems[type].length !== 0){
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1 ;
        }
        //create new item
        if(type==="exp"){
          newItem  = new Expense(ID, des, val);
        }
        else if(type==="inc"){
          newItem  = new Income(ID, des, val);
        }
        //return newItem
        data.allItems[type].push(newItem);
        return newItem;

      },

      deleteItem: function(type, id){
        var ids, index;

        ids = data.allItems[type].map(function(current){
          return current.id;
        })
        index = ids.indexOf(id);
        if(index !== -1){
          data.allItems[type].splice(index, 1);
        }
      },

      calculateBudget : function(){
        //1 total inc and exp

        calculateTotal("inc");
        calculateTotal("exp");

        //2 cal_budget
        data.budget = data.totals.inc - data.totals.exp;
        //
        if(data.totals.inc > 0)
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);


        //3 % calculation
      },

      calculatePercentage : function(){
        data.allItems.exp.forEach(function(cur){
          cur.calPercentage(data.totals.inc);
        });
      },

      getPercentage : function(){
        var allPerc = data.allItems.exp.map(function(cur){
          return cur.getPercentage();
        });
        return allPerc;
      },

      getBudget : function(){
        return{
          budget : data.budget,
          totalInc : data.totals.inc,
          totalExp : data.totals.exp,
          percentage : data.percentage
        };
      },

       testing : function(){
        console.log(data);
      }
    }


})();

//UI CONTROLLER
var ui_controller = (function(){
  var dom_strings = {
    input_type : ".add__type",
    input_description : ".add__description",
    input_value: ".add__value",
    input_btn : ".add__btn",
    incomeContainer : '.income__list',
    expenseContainer : '.expenses__list',
    budgetLabel : ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel : ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel : ".item__percentage",
    dateLabel : ".budget__title--month"
  }

  var formatNumber = function(num, type){
        //+, -
        // 2 decimal
        //, sep 1000
        var sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        var numSplit = num.split('.');
        var int = numSplit[0]; //string
        if(int.length > 3){
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }


        var dec = numSplit[1];

        return int + '.' + dec;
      }

      var nodeListForEach = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
          callBack(list[i], i);
        }
      }

  return{
    get_input : function(){
      return{
      type : document.querySelector(dom_strings.input_type).value,
      description : document.querySelector(dom_strings.input_description).value,
      value : parseFloat(document.querySelector(dom_strings.input_value).value)
    }
  },

    get_dom_strings : function(){
      return dom_strings
    },

    addListItem : function (obj, type){
      var html, newHTML, element;
      if(type==="inc"){
      element = dom_strings.incomeContainer;
      html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    }
      else{
      element =dom_strings.expenseContainer;
      html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    }
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);


    },

    deleteListItem : function(selectorId){
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    dispalyMonth : function(){
      var now, year, month, months;
      months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
       now = new Date();
       year = now.getFullYear();
       month = now.getMonth();
       document.querySelector(dom_strings.dateLabel).textContent = months[month] + " " + year;
    },

    clearField : function(){
      var fields, fieldsArr;

      fields = document.querySelectorAll(dom_strings.input_description + ', ' + dom_strings.input_value);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, i, array){
        current.value = "";
      })

      fieldsArr[0].focus();


    },

    dispalyBudget : function(budget_obj){
      var type = (budget_obj.budget > 0) ? "inc" : "exp";
      document.querySelector(dom_strings.budgetLabel).textContent = formatNumber(budget_obj.budget, type);
      document.querySelector(dom_strings.incomeLabel).textContent = formatNumber(budget_obj.totalInc, type);
      document.querySelector(dom_strings.expenseLabel).textContent = formatNumber(budget_obj.totalExp, type);
      if(budget_obj.percentage > 0)
      document.querySelector(dom_strings.percentageLabel).textContent = budget_obj.percentage + "%";
      else
      document.querySelector(dom_strings.percentageLabel).textContent = "---";

    },
    dispalyPercntages : function(percentages){

      var fields = document.querySelectorAll(dom_strings.expensesPercLabel);

      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0)
        current.textContent = percentages[index] + "%";
        else
        current.textContent = "---";
      })

    },
    changeType: function(){
      var fields = document.querySelectorAll(
        dom_strings.input_type + ',' +
        dom_strings.input_description + ',' +
        dom_strings.input_value
      );

      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector(dom_strings.input_btn).classList.toggle('red');
    }
    }




})();


// Global Controller
var controller = (function (budget_ctrl, ui_ctrl) {

  var setupEventListener = function(){
    var dom = ui_ctrl.get_dom_strings()
    document.querySelector(dom.input_btn).addEventListener('click', ctrl_add_item);
    document.addEventListener('keypress', function(event){
      if(event.keyCode === 13 || event.which === 13)
      {ctrl_add_item();}
    });

    document.querySelector(dom.container).addEventListener("click", ctrl_delete_item);

    document.querySelector(dom.input_type).addEventListener('change', ui_ctrl.changeType);

  }

  var updateBudget = function(){
    //1 Calculate the budget
    budget_ctrl.calculateBudget();
    //2 return the budget

    var budget = budget_ctrl.getBudget();
    //3 disply the budget
    ui_ctrl.dispalyBudget(budget);
  }

  var updatePercentage = function(){
    //1 Calculate Perc
    budget_ctrl.calculatePercentage();


    //2 read % from budget controller

      var allPerc = budget_ctrl.getPercentage();
    // console.log(allPerc);

    //3 update UI

    ui_ctrl.dispalyPercntages(allPerc);
  }

  var ctrl_add_item = function(){
    //1. input
    var input = ui_ctrl.get_input()
    //2. add to budget controller

    if(input.description !== "" && !isNaN(input.value) && input.value > 0){

    var newItem = budget_ctrl.addItem(input.type, input.description, input.value);

    //3.  add to ui

      ui_ctrl.addListItem(newItem, input.type);

      //3.2 clear screen
      ui_ctrl.clearField();

      updateBudget();
    //4. cal budget
    //5. dispaly budget

    //6 cal %
    updatePercentage();
  }
  }

var ctrl_delete_item = function(event){
  var itemId, splitId, type, id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemId){
      splitId = itemId.split("-")
      type = splitId[0];
      id = parseInt(splitId[1]);
      // delete the item from the data structures
      budget_ctrl.deleteItem(type, id);

      //delete from ui

      ui_ctrl.deleteListItem(itemId);

      //update and show budget
      updateBudget();

      //cal each %

      updatePercentage();
    }
}

return {
  init: function(){
    console.log("started");
    ui_ctrl.dispalyMonth();
    ui_ctrl.dispalyBudget({budget : 0,
                          totalInc : 0,
                          totalExp : 0,
                          percentage : -1});
    setupEventListener();
  }
}

})(budget_controller, ui_controller);



controller.init();
