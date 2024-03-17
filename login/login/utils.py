from urllib import request


def getUser(token):
	try:
		response = request.get('https://api.intra.42.fr/v2/me', headers={'Authorization': 'Bearer ' + token})
		return response.json()
	except:
		return "No user found"