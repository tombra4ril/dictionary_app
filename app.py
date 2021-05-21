from flask import Flask, render_template, url_for, request, flash, current_app
from flask.globals import current_app
from livereload import Server
from flaskext.mysql import MySQL
import pymysql.cursors
import json
import os
from colorama import init, Fore, Back, Style

# flash constants
flash_success = "flash-success"
flash_error = "flash-error"

app = Flask(__name__)
# flask app configuration
app.secret_key = "secret"
app.config["MYSQL_DATABASE_HOST"] = "localhost"
app.config["MYSQL_DATABASE_DB"] = "dictionary"
app.config["MYSQL_DATABASE_USER"] = "root"
app.config["MYSQL_DATABASE_PORT"] = 3306
app.config["MYSQL_DATABASE_PASSWORD"] = "tombra4ril"

mysql = MySQL(app, cursorclass = pymysql.cursors.DictCursor)

# Routes definition
@app.route("/", methods = ["GET", "POST"])
def index():
  print(Style.RESET_ALL)
  response = ""
  test = True
  if request.method == "POST":
    user_input = request.form["word"]
    test = validate_input(user_input)
    if test:
      connection = mysql.get_db()
      cursor = connection.cursor()
      cursor.execute("select meaning from words where word=%s", user_input)
      cursor_output = cursor.fetchall()
      connection.close()
      if len(cursor_output) > 0:
        response = {
          "word": user_input,
          "meaning": cursor_output[0]["meaning"]
        }
      else:
        response = {
          "word": user_input,
          "meaning": "Word not found!"
        }
    else:
      response = {
        "meaning": "You did not enter a valid word. Please try again!"
      }
  return render_template("index.html", response = response)

@app.route("/dashboard")
def dashboard():
  print(Style.RESET_ALL)
  connection = mysql.get_db()
  cursor = connection.cursor()
  cursor.execute("select * from words")
  cursor_output = cursor.fetchall()
  connection.close()
  response = cursor_output
  return render_template("dashboard.html", words = response)

@app.route("/word", methods = ["POST"])
def add_word():
  print(Style.RESET_ALL)
  test = True
  try:
    req = request.get_json()
    word = req["word"]
    meaning = req["meaning"]
    test = validate_input(word, meaning)
    if test:
      #
      try:
        connection = mysql.get_db()
        cursor = connection.cursor()
        cursor.execute("insert into words (word, meaning) values(%s, %s)", (word, meaning))
        connection.commit()
        connection.close()
        message = f"Successfully added the word '{word}'"
        show_flash(message, flash_success)
      except Exception:
        test = False
        print(f"{Back.RED}Insertion error: Was not able to insert to table!")
  except Exception:
    test = False
    print(f"{Back.RED}Error while processing the request!")
  finally:
    if test:
      return json.dumps("Success")
    else:
      return json.dumps("Error")

@app.route("/word/<id>/delete", methods = ["POST"])
def delete_word(id):
  print(Style.RESET_ALL)
  test = True
  try:
    word_id = id
    try:
      connection = mysql.get_db()
      cursor = connection.cursor()

      # get the word to delete
      cursor.execute("select word from words where id=%s;", word_id)
      cursor_output = cursor.fetchall()
      if len(cursor_output) > 0:
        word = cursor_output[0]["word"]

      # delete the row of the word
      cursor.execute("delete from words where id=%s;", (word_id))
      connection.commit()
      connection.close()
      message = f"Successfully deleted the word '{word}'"
      show_flash(message, flash_success)
    except Exception:
      test = False
      print(f"{Back.RED}Deletion error: Was not able to delete from table!")
  except Exception:
    test = False
    print(f"{Back.RED}Error while processing the request!")
  finally:
    if test:
      return json.dumps("Success")
    else:
      return json.dumps("Error")

@app.route("/word/<id>/edit", methods = ["POST"])
def edit_word(id):
  print(Style.RESET_ALL)
  print("Inside")
  test = True
  try:
    word_id = id
    req = request.get_json()
    word = req["word"]
    meaning = req["meaning"]
    test = validate_input(word, meaning)
    if test:
      try:
        connection = mysql.get_db()
        cursor = connection.cursor()
        cursor.execute("update words set word=%s, meaning=%s where id=%s", (word, meaning, word_id))
        connection.commit()
        connection.close()
        message = f"Successfully edited the word '{word}'"
        print(f"Just before flash message")
        show_flash(message, flash_success)
      except Exception:
        test = False
        print(f"{Back.RED}Updating error: Was not able to update the table!")
  except Exception:
    test = False
    print(f"{Back.RED}Error while processing the request!")
  finally:
    if test:
      return json.dumps("Success")
    else:
      return json.dumps(f"{Back.RED}Error")

@app.route("/upload", methods = ["POST"])
def upload():
  print(Style.RESET_ALL)
  test = True
  try:
    image = request.files["file"]
    _, file_ext = os.path.splitext(str(image.filename))
    print(f"filename: {_}")
    if test:
      if image:
        filepath = os.path.join(current_app.root_path, f"static/images/profile.png")
        # filepath = os.path.join(current_app.root_path, f"static/images/profile.{file_ext}")
        image.save(filepath)
        show_flash("Successfully uploaded image!", flash_success)
      else:
        show_flash("Error: upload failed!", flash_error)
        test = False
      try:
        pass
        # connection = mysql.get_db()
        # cursor = connection.cursor()
        # cursor.execute("update words set word=%s, meaning=%s where id=%s", (word, meaning, word_id))
        # connection.commit()
        # connection.close()
        # message = f"Successfully edited the word '{word}'"
        # print(f"Just before flash message")
        # show_flash(message, flash_success)
      except Exception:
        test = False
        print(f"{Back.RED}Uploading error: Was not able to upload image!")
  except Exception:
    test = False
    print(f"{Back.RED}Error while processing the request!")
  finally:
    if test:
      return json.dumps("Success")
    else:
      return json.dumps(f"{Back.RED}Error")

def validate_input(*args):
  output = True
  for input in args:
    if len(input.strip()) < 1:
      output = False
      message = f"Please fill in all fields, to add or edit a word!"
      show_flash(message, flash_error)
      print(f"{Back.RED}Error while validating input from user!")
    if not output:
      break
  return output
  
def show_flash(message, cat_operation):
  flash(message, cat_operation)

if __name__ == "__main__":
  init() # initialize colorama
  # app.run(debug = True, port = 5500)
  app.debug = True
  server = Server(app.wsgi_app)
  # server.watch("templates/*")
  # server.watch("static/css/*")
  # server.watch("static/js/*")
  server.serve()