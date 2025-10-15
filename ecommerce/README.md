# Local development

Use the project's virtualenv located at `.venv` for all local commands.

Activate the venv (zsh):

```
source .venv/bin/activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Run development server:

```
python manage.py runserver
```

Create a superuser:

```
python manage.py createsuperuser
```

Notes:
- The project reads settings from a `.env` file located one level above the `ecommerce/` folder. Keep secrets out of git; `.env` is ignored.
- If you don't have `.venv`, create it with `python -m venv .venv` and then activate it.